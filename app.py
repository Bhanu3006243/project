import re
from datetime import datetime
from flask import Flask, render_template, request   # 👈 added render_template
from flask_socketio import SocketIO, emit, join_room

users_online = set()
blocks = {}
rooms_messages = {}
HARASSMENT_PATTERNS = [
    r"\bkill\b",
    r"\bdie\b",
    r"\bstupid\b",
    r"\buseless\b",
    r"i will leak(ed)? your photos"
]
MILD_PATTERNS = [r"\bdumb\b", r"\bnoob\b", r"\bscrew\s*you\b"]
WHITELIST_CONTEXT = [r"kill\s+the\s+process", r"kill\s+the\s+task", r"beat\s+the\s+record"]

def detect_harassment(text):
    t = text.lower()
    for w in WHITELIST_CONTEXT:
        if re.search(w, t):
            return {"label": "safe", "severity": 0, "matches": []}
    matches = []
    severity = 0
    for p in HARASSMENT_PATTERNS:
        if re.search(p, t):
            matches.append(p)
            severity = max(severity, 2)
    if not matches:
        for p in MILD_PATTERNS:
            if re.search(p, t):
                matches.append(p)
                severity = max(severity, 1)
    label = "harassment" if matches else "safe"
    return {"label": label, "severity": severity, "matches": matches}

def room_id_for(a, b):
    return "::".join(sorted([a, b]))

@app.route("/")
def index():
    return render_template("index.html")


@socketio.on("register")
def on_register(data):
    username = data.get("username", "").strip()
    if not username:
        emit("register_response", {"ok": False, "error": "Username required"})
        return
    users_online.add(username)
    blocks.setdefault(username, set())
    emit("register_response", {"ok": True, "username": username, "users": sorted(users_online)})
    socketio.emit("users_update", {"users": sorted(users_online)})

@socketio.on("start_chat")
def on_start_chat(data):
    a = data.get("from")
    b = data.get("to")
    if not a or not b or a==b:
        emit("system", {"msg": "Choose a different user to chat."})
        return
    rid = room_id_for(a, b)
    join_room(rid)
    history = rooms_messages.get(rid, [])
    emit("chat_started", {"room": rid, "history": history})

@socketio.on("send_message")
@socketio.on("send_message")
@socketio.on("send_message")
def on_send_message(data):
    sender = data.get("from")
    receiver = data.get("to")
    text = data.get("text", "").strip()
    if not sender or not receiver or not text:
        return

    analysis = detect_harassment(text)
    rid = room_id_for(sender, receiver)
    msg = {
        "from": sender,
        "to": receiver,
        "text": text,
        "status": analysis["label"],
        "severity": analysis["severity"],
        "matches": analysis["matches"],
        "ts": datetime.utcnow().isoformat() + "Z"
    }

    rooms_messages.setdefault(rid, []).append(msg)

    if sender in blocks.get(receiver, set()):
        # Only send to sender, not the blocked receiver
        emit("new_message", {"room": rid, "message": msg}, room=request.sid)
        return

    # Send normally to both sender and receiver
    socketio.emit("new_message", {"room": rid, "message": msg}, room=rid)


@socketio.on("block_user")
def on_block_user(data):
    me = data.get("me")
    who = data.get("who")
    if not me or not who:
        return
    blocks.setdefault(me, set()).add(who)
    emit("block_list", {"me": me, "blocked": sorted(list(blocks[me]))})
    emit("system", {"msg": f"You blocked {who}."})

@socketio.on("unblock_user")
def on_unblock_user(data):
    me = data.get("me")
    who = data.get("who")
    if not me or not who:
        return
    blocks.setdefault(me, set()).discard(who)
    emit("block_list", {"me": me, "blocked": sorted(list(blocks[me]))})
    emit("system", {"msg": f"You unblocked {who}."})

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=10000)


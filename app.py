from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config['SECRET_KEY'] = "secret!"
socketio = SocketIO(app, cors_allowed_origins="*")

# store online users
online_users = set()

@app.route("/")
def home():
    return render_template("home.html")

@app.route("/chat")
def chat():
    return render_template("index.html")

# WebSocket events
@socketio.on("connect")
def handle_connect():
    emit("system", {"msg": "A user connected."}, broadcast=True)

@socketio.on("login")
def handle_login(username):
    if username in online_users:
        emit("loginError", "Username already taken")
    else:
        online_users.add(username)
        emit("loginSuccess", username)
        emit("updateUsers", list(online_users), broadcast=True)

@socketio.on("disconnect")
def handle_disconnect():
    # Remove user on disconnect
    # (In real case, you’d track sessions to remove correctly)
    emit("system", {"msg": "A user disconnected."}, broadcast=True)

@socketio.on("chatMessage")
def handle_message(data):
    # data: {text: "...", to: "username" (optional)}
    msg = data.get("text")
    emit("newMessage", {"msg": msg}, broadcast=True)

@socketio.on("blockUser")
def handle_block(target):
    emit("system", {"msg": f"You blocked {target}"})

@socketio.on("unblockUser")
def handle_unblock(target):
    emit("system", {"msg": f"You unblocked {target}"})

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)

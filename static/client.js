const socket = io();
let myUsername = "";
let talkingTo = "";

// --- Login/Register ---
document.getElementById("btnLogin").onclick = () => {
    const username = document.getElementById("username").value.trim();
    if (!username) { 
        document.getElementById("loginError").innerText = "Username required"; 
        return; 
    }
    socket.emit("register", { username });
};

socket.on("register_response", (res) => {
    if (res.ok) {
        myUsername = res.username;
        document.getElementById("login").style.display = "none";
        document.getElementById("chatContainer").style.display = "flex";
        document.getElementById("me").innerText = "You: " + myUsername;
    } else {
        document.getElementById("loginError").innerText = res.error;
    }
});

// --- Online Users ---
socket.on("users_update", (data) => {
    const list = document.getElementById("users");
    list.innerHTML = "";
    data.users.forEach(u => {
        if (u !== myUsername) {
            const li = document.createElement("li");
            li.innerText = u;
            li.onclick = () => {
                talkingTo = u;
                document.getElementById("talkingTo").innerText = "Talking to: " + u;
                document.querySelectorAll("#usersList li").forEach(el => el.classList.remove("active"));
                li.classList.add("active");
                socket.emit("start_chat", { from: myUsername, to: talkingTo });
            };
            list.appendChild(li);
        }
    });
});

// --- Chat History ---
socket.on("chat_started", (data) => {
    document.getElementById("messages").innerHTML = "";
    data.history.forEach(msg => addMessage(msg));
});

// --- Send Message ---
document.getElementById("btnSend").onclick = () => {
    const msg = document.getElementById("messageInput").value.trim();
    if (!msg) return;
    if (!talkingTo) { alert("Select a user to chat!"); return; }
    socket.emit("send_message", { from: myUsername, to: talkingTo, text: msg });
    document.getElementById("messageInput").value = "";
};

// --- Receive Messages ---
socket.on("new_message", (data) => addMessage(data.message));

function addMessage(msg) {
    const div = document.createElement("div");
    div.classList.add("msg");
    div.classList.add(msg.from === myUsername ? "me" : "other");

    if (msg.status === "harassment" && msg.from !== myUsername) {
        div.classList.add("harassment");
        div.innerHTML = `<b>${msg.from}:</b> ${msg.text} 
            <button onclick="blockUser('${msg.from}')">Block</button>
            <button onclick="ignoreUser('${msg.from}')">Ignore</button>
            <span class="time">${msg.ts}</span>`;
    } else if (msg.status === "system") {
        div.classList.add("system");
        div.innerHTML = `${msg.text} <span class="time">${msg.ts}</span>`;
    } else {
        div.innerHTML = `<b>${msg.from}:</b> ${msg.text} <span class="time">${msg.ts}</span>`;
    }

    document.getElementById("messages").appendChild(div);
    document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
}

// --- Block / Ignore Actions ---
function blockUser(user) { 
    if(user === myUsername) return;
    socket.emit("block_user", { me: myUsername, who: user }); 
    alert(`You have blocked ${user} (silent).`);
}
function ignoreUser(user) { 
    // do nothing
}

// --- Manual Block / Unblock ---
document.getElementById("btnBlock").onclick = () => {
    const target = document.getElementById("blockInput").value.trim();
    if (!target) { alert("Enter username to block"); return; }
    socket.emit("block_user", { me: myUsername, who: target });
    alert(`You have blocked ${target} (silent).`);
    document.getElementById("blockInput").value = "";
};

document.getElementById("btnUnblock").onclick = () => {
    const target = document.getElementById("blockInput").value.trim();
    if (!target) { alert("Enter username to unblock"); return; }
    socket.emit("unblock_user", { me: myUsername, who: target });
    alert(`You have unblocked ${target}.`);
    document.getElementById("blockInput").value = "";
};

// --- Disconnect ---
document.getElementById("disconnectBtn").onclick = () => {
    socket.disconnect();
    document.getElementById("chatContainer").style.display = "none";
    document.getElementById("login").style.display = "block";
    document.getElementById("username").value = "";
    document.getElementById("messages").innerHTML = "";
    document.getElementById("users").innerHTML = "";
    document.getElementById("talkingTo").innerText = "";
    document.getElementById("me").innerText = "";
    myUsername = "";
    talkingTo = "";
};

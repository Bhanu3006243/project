const socket = io();
let myUsername = "";
let talkingTo = "";

// Login
document.getElementById("btnLogin").onclick = () => {
    const username = document.getElementById("username").value.trim();
    if (username) {
        socket.emit("login", username);
    }
};

socket.on("loginSuccess", (username) => {
    myUsername = username;
    document.getElementById("login").style.display = "none";
    document.getElementById("chatContainer").style.display = "flex";
    document.getElementById("me").innerText = "You: " + username;
});

socket.on("loginError", (msg) => {
    document.getElementById("loginError").innerText = msg;
});

// Messages
document.getElementById("btnSend").onclick = () => {
    const msg = document.getElementById("messageInput").value.trim();
    if (msg) {
        socket.emit("chatMessage", { text: msg, to: talkingTo });
        document.getElementById("messageInput").value = "";
    }
};

socket.on("newMessage", (data) => {
    const div = document.createElement("div");
    div.className = "msg";
    div.innerText = data.msg;
    document.getElementById("messages").appendChild(div);
});

// Users
socket.on("updateUsers", (users) => {
    const list = document.getElementById("users");
    list.innerHTML = "";
    users.forEach(u => {
        const li = document.createElement("li");
        li.innerText = u;
        li.onclick = () => { talkingTo = u; document.getElementById("talkingTo").innerText = "Talking to: " + u; };
        list.appendChild(li);
    });
});

// Block
document.getElementById("btnBlock").onclick = () => {
    const target = document.getElementById("blockInput").value.trim();
    if (target) socket.emit("blockUser", target);
};

document.getElementById("btnUnblock").onclick = () => {
    const target = document.getElementById("blockInput").value.trim();
    if (target) socket.emit("unblockUser", target);
};

// Disconnect
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

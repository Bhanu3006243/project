const socket = io();
let myUsername = "";
let currentRoom = "";
let talkingTo = "";

// Login
document.getElementById("btnLogin").onclick = () => {
    const username = document.getElementById("username").value.trim();
    if(!username) return;
    socket.emit("register", {username});
};

socket.on("register_response", data => {
    if(!data.ok){
        document.getElementById("loginError").innerText = data.error;
        return;
    }
    myUsername = data.username;
    document.getElementById("me").innerText = myUsername;
    document.getElementById("login").style.display = "none";
    document.getElementById("chatContainer")const socket = io();
let myUsername = "";
let currentRoom = "";
let talkingTo = "";

// Login
document.getElementById("btnLogin").onclick = () => {
    const username = document.getElementById("username").value.trim();
    if(!username) return;
    socket.emit("register", {username});
};

socket.on("register_response", data => {
    if(!data.ok){
        document.getElementById("loginError").innerText = data.error;
        return;
    }
    myUsername = data.username;
    document.getElementById("me").innerText = myUsername;
    document.getElementById("login").style.display = "none";
    document.getElementById("chatContainer").style.display = "flex";
    updateUsers(data.users);
});

socket.on("users_update", data => updateUsers(data.users));

function updateUsers(users){
    const ul = document.getElementById("users");
    ul.innerHTML = "";
    users.forEach(user=>{
        if(user===myUsername) return;
        const li = document.createElement("li");
        li.innerText = user;
        li.onclick = ()=>startChat(user);
        ul.appendChild(li);
    });
}

function startChat(user){
    talkingTo = user;
    document.getElementById("talkingTo").innerText = talkingTo;
    socket.emit("start_chat", {from: myUsername, to: user});
}

socket.on("chat_started", data => {
    currentRoom = data.room;
    const msgBox = document.getElementById("messages");
    msgBox.innerHTML = "";
    data.history.forEach(msg=>addMessage(msg));
});

// Send message
document.getElementById("btnSend").onclick = ()=>{
    const text = document.getElementById("messageInput").value.trim();
    if(!text || !currentRoom) return;
    socket.emit("send_message",{from:myUsername,to:talkingTo,text});
    document.getElementById("messageInput").value="";
};

socket.on("new_message", data => {
    if(data.room!==currentRoom) return;
    addMessage(data.message);
});

// ✅ Modified addMessage (badge only for receiver)
function addMessage(msg){
    const msgBox = document.getElementById("messages");
    const div = document.createElement("div");
    div.className = "msg";

    const ts = new Date(msg.ts).toLocaleString();
    let badge = "";

    if (msg.status === "harassment" && msg.to === myUsername) {
        div.classList.add("harassment");
        badge = `<span class="harassmentBadge">
                    Harassment (${msg.severity === 2 ? "Severe" : "Mild"})
                 </span>`;
    }

    div.innerHTML = `<b>${msg.from} → ${msg.to}</b> • ${ts} ${badge}<br>${msg.text}`;

    if (msg.status === "harassment" && msg.to === myUsername) {
        const blockBtn = document.createElement("button");
        blockBtn.innerText = "Block";
        blockBtn.onclick = () => {
            document.getElementById("blockInput").value = msg.from;
            document.getElementById("btnBlock").click();
        };

        const ignoreBtn = document.createElement("button");
        ignoreBtn.innerText = "Ignore";
        ignoreBtn.onclick = () => {
            const messages = Array.from(document.getElementsByClassName("msg"));
            messages.forEach(m=>{
                if(m.innerText.includes(msg.from)) m.style.display = "none";
            });
        };

        const btnContainer = document.createElement("div");
        btnContainer.style.marginTop = "5px";
        btnContainer.appendChild(blockBtn);
        btnContainer.appendChild(ignoreBtn);

        div.appendChild(btnContainer);
    }

    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;
}

// System messages
socket.on("system", data=>{
    const msgBox = document.getElementById("messages");
    const div = document.createElement("div");
    div.className = "system";
    div.innerText = data.msg;
    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;
});

// Block/Unblock
document.getElementById("btnBlock").onclick = ()=>{
    const user = document.getElementById("blockInput").value.trim();
    if(!user) return;
    socket.emit("block_user",{me:myUsername,who:user});
};

document.getElementById("btnUnblock").onclick = ()=>{
    const user = document.getElementById("blockInput").value.trim();
    if(!user) return;
    socket.emit("unblock_user",{me:myUsername,who:user});
};

// ✅ Disconnect button logic
document.getElementById("disconnectBtn").onclick = () => {
    socket.disconnect();  // notify server

    // Reset UI to login screen
    document.getElementById("chatContainer").style.display = "none";
    document.getElementById("login").style.display = "block";
    document.getElementById("username").value = "";
    document.getElementById("loginError").innerText = "";
    document.getElementById("messages").innerHTML = "";
    document.getElementById("users").innerHTML = "";
    document.getElementById("talkingTo").innerText = "";
    document.getElementById("me").innerText = "";

    // Reset variables
    myUsername = "";
    currentRoom = "";
    talkingTo = "";
};
.style.display = "flex";
    updateUsers(data.users);
});

socket.on("users_update", data => updateUsers(data.users));

function updateUsers(users){
    const ul = document.getElementById("users");
    ul.innerHTML = "";
    users.forEach(user=>{
        if(user===myUsername) return;
        const li = document.createElement("li");
        li.innerText = user;
        li.onclick = ()=>startChat(user);
        ul.appendChild(li);
    });
}

function startChat(user){
    talkingTo = user;
    document.getElementById("talkingTo").innerText = talkingTo;
    socket.emit("start_chat", {from: myUsername, to: user});
}

socket.on("chat_started", data => {
    currentRoom = data.room;
    const msgBox = document.getElementById("messages");
    msgBox.innerHTML = "";
    data.history.forEach(msg=>addMessage(msg));
});

// Send message
document.getElementById("btnSend").onclick = ()=>{
    const text = document.getElementById("messageInput").value.trim();
    if(!text || !currentRoom) return;
    socket.emit("send_message",{from:myUsername,to:talkingTo,text});
    document.getElementById("messageInput").value="";
};

socket.on("new_message", data => {
    if(data.room!==currentRoom) return;
    addMessage(data.message);
});

// ✅ Modified addMessage (badge only for receiver)
function addMessage(msg){
    const msgBox = document.getElementById("messages");
    const div = document.createElement("div");
    div.className = "msg";

    const ts = new Date(msg.ts).toLocaleString();
    let badge = "";

    // Harassment styling only for receiver
    if (msg.status === "harassment" && msg.to === myUsername) {
        div.classList.add("harassment");
        badge = `<span class="harassmentBadge">
                    Harassment (${msg.severity === 2 ? "Severe" : "Mild"})
                 </span>`;
    }

    div.innerHTML = `<b>${msg.from} → ${msg.to}</b> • ${ts} ${badge}<br>${msg.text}`;

    // Add Block / Ignore buttons for harassment messages
    if (msg.status === "harassment" && msg.to === myUsername) {
        const blockBtn = document.createElement("button");
        blockBtn.innerText = "Block";
        blockBtn.onclick = () => {
            document.getElementById("blockInput").value = msg.from;
            document.getElementById("btnBlock").click();
        };

        const ignoreBtn = document.createElement("button");
        ignoreBtn.innerText = "Ignore";
        ignoreBtn.onclick = () => {
            // Optional: just visually hide messages from this sender
            const messages = Array.from(document.getElementsByClassName("msg"));
            messages.forEach(m=>{
                if(m.innerText.includes(msg.from)) m.style.display = "none";
            });
        };

        const btnContainer = document.createElement("div");
        btnContainer.style.marginTop = "5px";
        btnContainer.appendChild(blockBtn);
        btnContainer.appendChild(ignoreBtn);

        div.appendChild(btnContainer);
    }

    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;
}


// System messages
socket.on("system", data=>{
    const msgBox = document.getElementById("messages");
    const div = document.createElement("div");
    div.className = "system";
    div.innerText = data.msg;
    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;
});

// Block/Unblock
document.getElementById("btnBlock").onclick = ()=>{
    const user = document.getElementById("blockInput").value.trim();
    if(!user) return;
    socket.emit("block_user",{me:myUsername,who:user});
};

document.getElementById("btnUnblock").onclick = ()=>{
    const user = document.getElementById("blockInput").value.trim();
    if(!user) return;
    socket.emit("unblock_user",{me:myUsername,who:user});
};

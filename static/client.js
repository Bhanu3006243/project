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

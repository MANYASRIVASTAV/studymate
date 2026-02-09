// ===============================
// GROUP STUDY - FINAL
// ===============================


// Detect ws / wss


// ===============================
// WebSocket Config (LOCAL FIX)
// ===============================

// Backend runs on port 10000
let socketURL = "ws://localhost:10000/ws";

// Create socket
let socket = new WebSocket(socketURL);


// Connect



// Globals
let socketReady = false;

let username = "";
let currentRoom = "";

let seconds = 0;
let timer = null;


// Connected
socket.onopen = function () {

    console.log("✅ Connected");

    socketReady = true;
};


// Message
socket.onmessage = function (event) {

    let data = JSON.parse(event.data);

    console.log("📩", data);


    if (data.type === "created") {

        currentRoom = data.room;

        document.getElementById("roomInfo").innerText =
            "Connected: " + currentRoom;

        renderMembers(data.members);
    }


    if (data.type === "joined") {

        currentRoom = data.room;

        document.getElementById("roomInfo").innerText =
            "Connected: " + currentRoom;

        renderMembers(data.members);
    }


    if (data.type === "update") {

        renderMembers(data.members);
    }


    if (data.type === "error") {

        alert(data.msg);
    }
};


// Error
socket.onerror = function (e) {

    console.log("❌ Socket error", e);
};


// ===============================
// BUTTONS
// ===============================


function createRoom() {

    if (!socketReady) {

        alert("Server not connected");
        return;
    }


    username =
        document.getElementById("nameInput").value.trim();


    if (username === "") {

        alert("Enter name");
        return;
    }


    socket.send(JSON.stringify({

        action: "create",
        username: username

    }));
}


function joinRoom() {

    if (!socketReady) {

        alert("Server not connected");
        return;
    }


    username =
        document.getElementById("nameInput").value.trim();

    let room =
        document.getElementById("roomInput").value.trim();


    if (username === "" || room === "") {

        alert("Fill all fields");
        return;
    }


    socket.send(JSON.stringify({

        action: "join",
        username: username,
        room: room

    }));
}


function startStudy() {

    if (!currentRoom) {

        alert("Join room first");
        return;
    }


    clearInterval(timer);


    timer = setInterval(function () {

        seconds++;

        updateUI();

        sendUpdate("studying");

    }, 1000);
}


function stopStudy() {

    clearInterval(timer);

    sendUpdate("offline");
}


function sendUpdate(status) {

    if (!socketReady) return;


    socket.send(JSON.stringify({

        action: "update",
        username: username,
        room: currentRoom,
        time: seconds,
        status: status

    }));
}


// ===============================
// UI
// ===============================


function updateUI() {

    let min = Math.floor(seconds / 60);
    let sec = seconds % 60;


    document.getElementById("timer").innerText =
        min + ":" + (sec < 10 ? "0" + sec : sec);
}


function renderMembers(members) {

    let box =
        document.getElementById("members");

    box.innerHTML = "";


    for (let user in members) {

        let info = members[user];

        let icon =
            info.status === "studying"
                ? "🟢"
                : "🔴";


        let min = Math.floor(info.time / 60);
        let sec = info.time % 60;


        box.innerHTML += `

            <div class="member">

                <span>${user}</span>

                <span>${icon}</span>

                <span>${min}:${sec < 10 ? "0"+sec : sec}</span>

            </div>

        `;
    }
}



























// ===================================
// StudyMate Group - FINAL FIX
// ===================================


// ---------------- VARIABLES ----------------

let socket;
let socketReady = false;

let username = "";
let currentRoom = "";

let seconds = 0;
let timer = null;


// ---------------- SOCKET CONNECT ----------------

function connectSocket() {

    const protocol =
        location.protocol === "https:" ? "wss://" : "ws://";

    socket = new WebSocket(
        protocol + location.host + "/ws"
    );


    socket.onopen = () => {
        console.log("✅ Connected");
        socketReady = true;
    };


    socket.onerror = (e) => {
        console.log("❌ Socket Error", e);
    };


    socket.onclose = () => {

        console.log("⚠️ Disconnected... Reconnecting");

        socketReady = false;

        setTimeout(connectSocket, 2000);
    };


    socket.onmessage = (event) => {

        const data = JSON.parse(event.data);


        // Room created
        if (data.type === "created") {

            currentRoom = data.room;

            document.getElementById("roomInfo").innerText =
                "Connected: " + currentRoom;

            renderMembers(data.members);
        }


        // Room joined
        if (data.type === "joined") {

            currentRoom = data.room;

            document.getElementById("roomInfo").innerText =
                "Connected: " + currentRoom;

            renderMembers(data.members);
        }


        // Update
        if (data.type === "update") {

            renderMembers(data.members);
        }


        // Error
        if (data.type === "error") {

            alert(data.msg);
        }
    };
}


// Start socket
connectSocket();


// ---------------- BUTTON EVENTS ----------------

// Wait till page loads
window.onload = () => {

    document
        .getElementById("createBtn")
        .addEventListener("click", createRoom);

    document
        .getElementById("joinBtn")
        .addEventListener("click", joinRoom);
};


// ---------------- CREATE ROOM ----------------

function createRoom() {

    if (!socketReady) {

        alert("Connecting... wait");
        return;
    }


    username =
        document.getElementById("nameInput").value.trim();


    if (!username) {

        alert("Enter name");
        return;
    }


    socket.send(JSON.stringify({

        action: "create",
        username: username

    }));
}


// ---------------- JOIN ROOM ----------------

function joinRoom() {

    if (!socketReady) {

        alert("Connecting... wait");
        return;
    }


    username =
        document.getElementById("nameInput").value.trim();

    let room =
        document.getElementById("roomInput").value.trim();


    if (!username || !room) {

        alert("Enter name & room");
        return;
    }


    socket.send(JSON.stringify({

        action: "join",
        username: username,
        room: room

    }));
}


// ---------------- START ----------------

function startStudy() {

    if (!currentRoom) {

        alert("Join room first");
        return;
    }


    clearInterval(timer);


    timer = setInterval(() => {

        seconds++;

        updateUI();

        sendUpdate("studying");

    }, 1000);
}


// ---------------- STOP ----------------

function stopStudy() {

    clearInterval(timer);

    sendUpdate("offline");
}


// ---------------- SEND UPDATE ----------------

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


// ---------------- UI ----------------

function updateUI() {

    let min = Math.floor(seconds / 60);
    let sec = seconds % 60;


    document.getElementById("timer").innerText =
        min + ":" + (sec < 10 ? "0" + sec : sec);
}


// ---------------- MEMBERS ----------------

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

                <span>${min}:${sec < 10 ? "0" + sec : sec}</span>

            </div>

        `;
    }
}

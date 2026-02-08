// group.js
// --------------------------------
// WebSocket Client (FastAPI)
// --------------------------------

let protocol =
    location.protocol === "https:" ? "wss://" : "ws://";

const socket = new WebSocket(
    protocol + location.host + "/ws"
);


// Username
let username = "";


// Variables
let currentRoom = "";
let seconds = 0;
let timer = null;


// Connected
socket.onopen = () => {

    console.log("Connected to backend ✅");
};


// Messages
socket.onmessage = (event) => {

    let data = JSON.parse(event.data);


    // Created
    if (data.type === "created") {

        currentRoom = data.room;

        document.getElementById("roomInfo").innerText =
            "Connected: " + currentRoom;

        renderMembers(data.members);
    }


    // Joined
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


// Create Room
function createRoom() {

    username =
        document.getElementById("nameInput").value.trim();

    if (!username) {

        alert("Enter your name");
        return;
    }


    socket.send(JSON.stringify({

        action: "create",
        username: username

    }));
}


// Join Room
function joinRoom() {

    username =
        document.getElementById("nameInput").value.trim();

    let room =
        document.getElementById("roomInput").value.trim();


    if (!username || !room) {

        alert("Enter name and room ID");
        return;
    }


    socket.send(JSON.stringify({

        action: "join",
        username: username,
        room: room

    }));
}


// Start Study
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


// Stop Study
function stopStudy() {

    clearInterval(timer);

    sendUpdate("offline");
}


// Send Update
function sendUpdate(status) {

    socket.send(JSON.stringify({

        action: "update",
        username: username,
        room: currentRoom,
        time: seconds,
        status: status

    }));
}


// UI
function updateUI() {

    let min = Math.floor(seconds / 60);
    let sec = seconds % 60;

    document.getElementById("timer").innerText =
        min + ":" + (sec < 10 ? "0" + sec : sec);
}


// Members
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

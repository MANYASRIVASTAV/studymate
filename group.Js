// =====================================
// StudyMate - Group Study (FINAL JS)
// =====================================


// -----------------------------
// GLOBAL VARIABLES
// -----------------------------

let socket;              // WebSocket object
let socketReady = false; // Is socket connected?

let username = "";       // User name
let currentRoom = "";    // Current room ID

let seconds = 0;         // Timer seconds
let timer = null;        // setInterval reference



// -----------------------------
// CONNECT TO BACKEND
// -----------------------------

function connectSocket() {

    // Decide ws or wss automatically
    const protocol =
        window.location.protocol === "https:" ? "wss://" : "ws://";

    // Create socket connection
    socket = new WebSocket(
        protocol + window.location.host + "/ws"
    );


    // When connected
    socket.onopen = () => {

        console.log("✅ WebSocket Connected");
        socketReady = true;
    };


    // If error
    socket.onerror = (err) => {

        console.log("❌ WebSocket Error", err);
    };


    // When disconnected
    socket.onclose = () => {

        console.log("⚠️ Socket Closed. Reconnecting...");

        socketReady = false;

        // Try reconnect after 2 sec
        setTimeout(connectSocket, 2000);
    };


    // When message comes from server
    socket.onmessage = (event) => {

        let data = JSON.parse(event.data);


        // When room created
        if (data.type === "created") {

            currentRoom = data.room;

            document.getElementById("roomInfo").innerText =
                "Connected: " + currentRoom;

            renderMembers(data.members);
        }


        // When joined
        if (data.type === "joined") {

            currentRoom = data.room;

            document.getElementById("roomInfo").innerText =
                "Connected: " + currentRoom;

            renderMembers(data.members);
        }


        // When members update
        if (data.type === "update") {

            renderMembers(data.members);
        }


        // When error
        if (data.type === "error") {

            alert(data.msg);
        }
    };
}


// Start socket when page loads
connectSocket();



// -----------------------------
// CREATE ROOM
// -----------------------------

function createRoom() {

    // Check socket
    if (!socketReady) {

        alert("Connecting... Please wait");
        return;
    }


    // Get name
    username =
        document.getElementById("nameInput").value.trim();


    if (!username) {

        alert("Enter your name first");
        return;
    }


    // Send to server
    socket.send(JSON.stringify({

        action: "create",
        username: username

    }));
}



// -----------------------------
// JOIN ROOM
// -----------------------------

function joinRoom() {

    // Check socket
    if (!socketReady) {

        alert("Connecting... Please wait");
        return;
    }


    // Get values
    username =
        document.getElementById("nameInput").value.trim();

    let room =
        document.getElementById("roomInput").value.trim();


    if (!username || !room) {

        alert("Enter name and room ID");
        return;
    }


    // Send to server
    socket.send(JSON.stringify({

        action: "join",
        username: username,
        room: room

    }));
}



// -----------------------------
// START STUDY
// -----------------------------

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



// -----------------------------
// STOP STUDY
// -----------------------------

function stopStudy() {

    clearInterval(timer);

    sendUpdate("offline");
}



// -----------------------------
// SEND UPDATE TO SERVER
// -----------------------------

function sendUpdate(status) {

    // Check socket
    if (!socketReady) return;


    socket.send(JSON.stringify({

        action: "update",
        username: username,
        room: currentRoom,
        time: seconds,
        status: status

    }));
}



// -----------------------------
// UPDATE TIMER UI
// -----------------------------

function updateUI() {

    let min = Math.floor(seconds / 60);
    let sec = seconds % 60;


    document.getElementById("timer").innerText =
        min + ":" + (sec < 10 ? "0" + sec : sec);
}



// -----------------------------
// SHOW MEMBERS
// -----------------------------

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

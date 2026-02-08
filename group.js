// ================================
// StudyMate Group Study - FINAL
// ================================


// GLOBAL VARIABLES
let socket;
let socketReady = false;

let username = "";
let currentRoom = "";

let seconds = 0;
let timer = null;


// CONNECT TO SERVER
function connectSocket() {

    var protocol =
        location.protocol === "https:" ? "wss://" : "ws://";

    socket = new WebSocket(
        protocol + location.host + "/ws"
    );


    socket.onopen = function () {
        console.log("Connected");
        socketReady = true;
    };


    socket.onerror = function (e) {
        console.log("Socket error", e);
    };


    socket.onclose = function () {

        console.log("Disconnected, reconnecting...");

        socketReady = false;

        setTimeout(connectSocket, 2000);
    };


    socket.onmessage = function (event) {

        var data = JSON.parse(event.data);


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
}


// START SOCKET
connectSocket();


// CREATE ROOM
function createRoom() {

    if (!socketReady) {
        alert("Connecting... please wait");
        return;
    }


    username =
        document.getElementById("nameInput").value.trim();


    if (username === "") {

        alert("Enter your name");
        return;
    }


    socket.send(JSON.stringify({

        action: "create",
        username: username

    }));
}


// JOIN ROOM
function joinRoom() {

    if (!socketReady) {
        alert("Connecting... please wait");
        return;
    }


    username =
        document.getElementById("nameInput").value.trim();

    var room =
        document.getElementById("roomInput").value.trim();


    if (username === "" || room === "") {

        alert("Enter name and room ID");
        return;
    }


    socket.send(JSON.stringify({

        action: "join",
        username: username,
        room: room

    }));
}


// START STUDY
function startStudy() {

    if (currentRoom === "") {

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


// STOP STUDY
function stopStudy() {

    clearInterval(timer);

    sendUpdate("offline");
}


// SEND UPDATE
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


// UPDATE TIMER UI
function updateUI() {

    var min = Math.floor(seconds / 60);
    var sec = seconds % 60;


    document.getElementById("timer").innerText =
        min + ":" + (sec < 10 ? "0" + sec : sec);
}


// SHOW MEMBERS
function renderMembers(members) {

    var box =
        document.getElementById("members");

    box.innerHTML = "";


    for (var user in members) {

        var info = members[user];


        var icon =
            info.status === "studying"
                ? "ONLINE"
                : "OFFLINE";


        var min = Math.floor(info.time / 60);
        var sec = info.time % 60;


        box.innerHTML +=

            "<div class='member'>" +
            "<span>" + user + "</span>" +
            "<span>" + icon + "</span>" +
            "<span>" + min + ":" +
            (sec < 10 ? "0" + sec : sec) +
            "</span>" +
            "</div>";
    }
}

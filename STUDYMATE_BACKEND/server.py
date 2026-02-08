# server.py
# --------------------------------
# FastAPI + WebSocket Group Study
# --------------------------------

import os

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse


# Create app
app = FastAPI()


# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Project root (studymate folder)

# Project root (same folder as server.py)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))



# Store rooms
rooms = {}        # {room: {username: websocket}}
user_data = {}    # {room: {username: {time, status}}}


# ================= WEBSOCKET =================

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):

    await ws.accept()
    print("Client connected ✅")

    try:

        while True:

            data = await ws.receive_json()

            action = data["action"]


            # -------- CREATE ROOM --------
            if action == "create":

                name = data["username"]

                room = "R" + str(len(rooms) + 100)

                rooms[room] = {name: ws}

                user_data[room] = {
                    name: {"time": 0, "status": "online"}
                }

                await ws.send_json({
                    "type": "created",
                    "room": room,
                    "members": user_data[room]
                })


            # -------- JOIN ROOM --------
            elif action == "join":

                name = data["username"]
                room = data["room"]

                if room not in rooms:

                    await ws.send_json({
                        "type": "error",
                        "msg": "Room not found"
                    })
                    continue


                rooms[room][name] = ws

                user_data[room][name] = {
                    "time": 0,
                    "status": "online"
                }


                # Send update to all users
                for user in rooms[room].values():

                    await user.send_json({
                        "type": "joined",
                        "room": room,
                        "members": user_data[room]
                    })


            # -------- UPDATE --------
            elif action == "update":

                room = data["room"]
                name = data["username"]

                user_data[room][name]["time"] = data["time"]
                user_data[room][name]["status"] = data["status"]


                for user in rooms[room].values():

                    await user.send_json({
                        "type": "update",
                        "members": user_data[room]
                    })


    except WebSocketDisconnect:

        print("Client disconnected ❌")


# ================= FRONTEND =================


@app.get("/")
def home():
    return "StudyMate Backend Running"


@app.get("/group")
def serve_group():

    return FileResponse(
        os.path.join(BASE_DIR, "group.html")
    )


@app.get("/group.js")
def serve_js():

    return FileResponse(
        os.path.join(BASE_DIR, "group.js")
    )

# =====================================
# StudyMate WebSocket Server (Fixed)
# =====================================

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse

from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

import os
import json
import random
import string


# -------------------------------------
# Create app
# -------------------------------------

app = FastAPI()


# -------------------------------------
# Allow all domains (for deployment)
# -------------------------------------

# Allow frontend to talk with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Allow all domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Trust proxy / hosting platform
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]
)


# -------------------------------------
# Base directory
# -------------------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)


# -------------------------------------
# Store rooms in memory
# -------------------------------------

rooms = {}


# -------------------------------------
# Serve frontend
# -------------------------------------

@app.get("/")
def home():
    return FileResponse(os.path.join(BASE_DIR, "login.html"))


@app.get("/{page}")
def pages(page: str):

    file_path = os.path.join(BASE_DIR, page)

    if os.path.exists(file_path):
        return FileResponse(file_path)

    return {"detail": "Not Found"}


# -------------------------------------
# WebSocket
# -------------------------------------

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):

    # Accept connection
    await ws.accept()

    print("✅ Client connected")


    try:

        while True:

            # Receive message
            data = await ws.receive_text()

            # Convert JSON string → Python dict
            data = json.loads(data)

            action = data.get("action")


            # ---------------- CREATE ROOM ----------------
            if action == "create":

                # Generate random room ID
                room = ''.join(
                    random.choices(
                        string.ascii_uppercase + string.digits,
                        k=6
                    )
                )

                # Create room
                rooms[room] = {
                    "members": {
                        data["username"]: {
                            "time": 0,
                            "status": "online"
                        }
                    },
                    "clients": [ws]
                }

                # Send to creator
                await ws.send_json({
                    "type": "created",
                    "room": room,
                    "members": rooms[room]["members"]
                })


            # ---------------- JOIN ROOM ----------------
            elif action == "join":

                room = data["room"]

                # If room not exist
                if room not in rooms:

                    await ws.send_json({
                        "type": "error",
                        "msg": "Room not found"
                    })

                    continue


                # Add member
                rooms[room]["members"][data["username"]] = {
                    "time": 0,
                    "status": "online"
                }


                # Save client socket
                rooms[room]["clients"].append(ws)


                # Notify all users
                for client in rooms[room]["clients"]:

                    await client.send_json({
                        "type": "joined",
                        "room": room,
                        "members": rooms[room]["members"]
                    })


            # ---------------- UPDATE ----------------
            elif action == "update":

                room = data["room"]

                if room not in rooms:
                    continue


                # Update user data
                rooms[room]["members"][data["username"]] = {
                    "time": data["time"],
                    "status": data["status"]
                }


                # Send update to all
                for client in rooms[room]["clients"]:

                    await client.send_json({
                        "type": "update",
                        "members": rooms[room]["members"]
                    })


    except WebSocketDisconnect:

        print("❌ Client disconnected")

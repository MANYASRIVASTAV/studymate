# server.py
# ----------------------------
# FINAL FULL SERVER (ALL PAGES)
# ----------------------------

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
import json
import random
import string


app = FastAPI()


# ----------------------------
# Paths
# ----------------------------

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# ----------------------------
# Serve All Static Files
# ----------------------------

app.mount("/static", StaticFiles(directory=BASE_DIR), name="static")


# ----------------------------
# Store Rooms
# ----------------------------

rooms = {}
connections = []


# ----------------------------
# Home
# ----------------------------

@app.get("/")
def home():
    return FileResponse(os.path.join(BASE_DIR, "INDEX.html"))


# ----------------------------
# Serve Any HTML Page
# ----------------------------

@app.get("/{page}")
def serve_pages(page: str):

    file_path = os.path.join(BASE_DIR, page)

    if os.path.exists(file_path):
        return FileResponse(file_path)

    return {"error": "Page not found"}


# ----------------------------
# WebSocket
# ----------------------------

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):

    await ws.accept()
    print("Client connected ✅")

    connections.append(ws)

    try:
        while True:

            data = await ws.receive_text()
            msg = json.loads(data)


            action = msg.get("action")
            user = msg.get("username")
            room = msg.get("room")


            # CREATE ROOM
            if action == "create":

                room = "".join(
                    random.choices(
                        string.ascii_uppercase + string.digits,
                        k=6
                    )
                )

                rooms[room] = {}

                rooms[room][user] = {
                    "time": 0,
                    "status": "online"
                }

                await ws.send_json({
                    "type": "created",
                    "room": room,
                    "members": rooms[room]
                })


            # JOIN ROOM
            elif action == "join":

                if room not in rooms:

                    await ws.send_json({
                        "type": "error",
                        "msg": "Room not found"
                    })

                    continue


                rooms[room][user] = {
                    "time": 0,
                    "status": "online"
                }


                for conn in connections:
                    await conn.send_json({
                        "type": "joined",
                        "room": room,
                        "members": rooms[room]
                    })


            # UPDATE
            elif action == "update":

                if room not in rooms:
                    continue

                if user not in rooms[room]:
                    continue


                rooms[room][user]["time"] = msg["time"]
                rooms[room][user]["status"] = msg["status"]


                for conn in connections:
                    await conn.send_json({
                        "type": "update",
                        "members": rooms[room]
                    })


    except WebSocketDisconnect:

        print("Client disconnected ❌")

        connections.remove(ws)

# server.py

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

import os
import json
import random
import string


app = FastAPI()


# Project root (studymate folder)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Serve everything (html, css, js) from root
app.mount(
    "/",
    StaticFiles(directory=BASE_DIR, html=True),
    name="frontend"
)


# Rooms
rooms = {}
clients = []


# WebSocket
@app.websocket("/ws")
async def websocket(ws: WebSocket):

    await ws.accept()
    clients.append(ws)

    print("Client connected")


    try:

        while True:

            data = await ws.receive_text()
            msg = json.loads(data)

            action = msg.get("action")
            user = msg.get("username")
            room = msg.get("room")


            # CREATE
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


            # JOIN
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


                for c in clients:
                    await c.send_json({
                        "type": "joined",
                        "room": room,
                        "members": rooms[room]
                    })


            # UPDATE
            elif action == "update":

                if room not in rooms:
                    continue


                rooms[room][user]["time"] = msg["time"]
                rooms[room][user]["status"] = msg["status"]


                for c in clients:
                    await c.send_json({
                        "type": "update",
                        "members": rooms[room]
                    })


    except WebSocketDisconnect:

        clients.remove(ws)
        print("Client disconnected")

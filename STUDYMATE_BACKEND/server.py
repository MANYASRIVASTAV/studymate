# =====================================
# StudyMate WebSocket Server (Render Safe)
# =====================================

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

import json
import random
import string
import asyncio


app = FastAPI()


# -------------------------------------
# Middlewares (IMPORTANT for Render)
# -------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]
)


# -------------------------------------
# In-memory storage
# -------------------------------------

rooms = {}


# -------------------------------------
# WebSocket endpoint
# -------------------------------------

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):

    # Accept connection
    await ws.accept()
    print("✅ Client connected")

    room_id = None
    username = None

    try:

        while True:

            # Wait for message (timeout safety)
            data = await asyncio.wait_for(
                ws.receive_text(),
                timeout=60
            )

            data = json.loads(data)

            action = data.get("action")


            # ---------- CREATE ----------
            if action == "create":

                room_id = ''.join(
                    random.choices(
                        string.ascii_uppercase + string.digits,
                        k=6
                    )
                )

                username = data["username"]

                rooms[room_id] = {
                    "members": {
                        username: {
                            "time": 0,
                            "status": "online"
                        }
                    },
                    "clients": [ws]
                }

                await ws.send_json({
                    "type": "created",
                    "room": room_id,
                    "members": rooms[room_id]["members"]
                })


            # ---------- JOIN ----------
            elif action == "join":

                room_id = data["room"]
                username = data["username"]

                if room_id not in rooms:

                    await ws.send_json({
                        "type": "error",
                        "msg": "Room not found"
                    })

                    continue


                rooms[room_id]["members"][username] = {
                    "time": 0,
                    "status": "online"
                }

                rooms[room_id]["clients"].append(ws)


                for client in rooms[room_id]["clients"]:

                    await client.send_json({
                        "type": "joined",
                        "room": room_id,
                        "members": rooms[room_id]["members"]
                    })


            # ---------- UPDATE ----------
            elif action == "update":

                if room_id not in rooms:
                    continue


                rooms[room_id]["members"][username] = {
                    "time": data["time"],
                    "status": data["status"]
                }


                for client in rooms[room_id]["clients"]:

                    await client.send_json({
                        "type": "update",
                        "members": rooms[room_id]["members"]
                    })


    except (WebSocketDisconnect, asyncio.TimeoutError):

        print("❌ Client disconnected")

        # Cleanup
        if room_id and room_id in rooms:

            if ws in rooms[room_id]["clients"]:
                rooms[room_id]["clients"].remove(ws)

            if username in rooms[room_id]["members"]:
                del rooms[room_id]["members"][username]


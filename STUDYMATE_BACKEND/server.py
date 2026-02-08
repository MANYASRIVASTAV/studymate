from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
import random
import string


app = FastAPI()


# ================= PATH =================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# ================= STATIC =================

app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR),
    name="static"
)


# ================= HTML =================

@app.get("/")
def home():
    return FileResponse(os.path.join(BASE_DIR, "INDEX.html"))


@app.get("/group.html")
def group():
    return FileResponse(os.path.join(BASE_DIR, "group.html"))


# ================= DATA =================

rooms = {}
connections = {}


def gen_room():
    return "".join(
        random.choices(string.ascii_uppercase + string.digits, k=6)
    )


async def broadcast(room):

    if room not in rooms:
        return

    data = {
        "type": "update",
        "members": rooms[room]
    }

    for ws, info in connections.items():
        if info[0] == room:
            await ws.send_json(data)


# ================= WEBSOCKET =================

@app.websocket("/ws")
async def websocket(ws: WebSocket):

    await ws.accept()
    print("Connected ✅")

    try:

        while True:

            data = await ws.receive_json()
            action = data.get("action")


            # CREATE
            if action == "create":

                user = data["username"]

                room = gen_room()

                rooms[room] = {
                    user: {"time": 0, "status": "offline"}
                }

                connections[ws] = (room, user)

                await ws.send_json({
                    "type": "created",
                    "room": room,
                    "members": rooms[room]
                })


            # JOIN
            elif action == "join":

                user = data["username"]
                room = data["room"]

                if room not in rooms:

                    await ws.send_json({
                        "type": "error",
                        "msg": "Room not found"
                    })

                    continue


                rooms[room][user] = {
                    "time": 0,
                    "status": "offline"
                }

                connections[ws] = (room, user)

                await ws.send_json({
                    "type": "joined",
                    "room": room,
                    "members": rooms[room]
                })

                await broadcast(room)


            # UPDATE
            elif action == "update":

                user = data["username"]
                room = data["room"]

                if room in rooms:

                    rooms[room][user] = {
                        "time": data["time"],
                        "status": data["status"]
                    }

                    await broadcast(room)


    except WebSocketDisconnect:

        print("Disconnected ❌")

        if ws in connections:

            room, user = connections[ws]

            if room in rooms and user in rooms[room]:

                del rooms[room][user]

                if not rooms[room]:
                    del rooms[room]

                else:
                    await broadcast(room)

            del connections[ws]

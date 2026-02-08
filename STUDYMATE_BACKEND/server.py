from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
import os

app = FastAPI()

# =============================
# ROOT PATH (studymate folder)
# =============================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# =============================
# SERVE ANY FILE FROM ROOT
# =============================

@app.get("/")
def home():
    return FileResponse(os.path.join(BASE_DIR, "INDEX.html"))


@app.get("/{file_name}")
def serve_files(file_name: str):

    file_path = os.path.join(BASE_DIR, file_name)

    if os.path.exists(file_path):
        return FileResponse(file_path)

    return {"detail": "Not Found"}


# =============================
# WEBSOCKET
# =============================

rooms = {}


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):

    await ws.accept()

    try:

        while True:

            data = await ws.receive_json()

            action = data.get("action")
            user = data.get("username")
            room = data.get("room")

            # CREATE
            if action == "create":

                room_id = user + "_room"

                rooms[room_id] = {
                    "members": {
                        user: {
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


            # JOIN
            elif action == "join":

                if room not in rooms:

                    await ws.send_json({
                        "type": "error",
                        "msg": "Room not found"
                    })
                    continue


                rooms[room]["members"][user] = {
                    "time": 0,
                    "status": "online"
                }

                rooms[room]["clients"].append(ws)

                for client in rooms[room]["clients"]:
                    await client.send_json({
                        "type": "joined",
                        "room": room,
                        "members": rooms[room]["members"]
                    })


            # UPDATE
            elif action == "update":

                if room not in rooms:
                    continue


                rooms[room]["members"][user] = {
                    "time": data["time"],
                    "status": data["status"]
                }

                for client in rooms[room]["clients"]:
                    await client.send_json({
                        "type": "update",
                        "members": rooms[room]["members"]
                    })


    except WebSocketDisconnect:

        print("Disconnected")

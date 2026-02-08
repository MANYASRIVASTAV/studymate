from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()


# ===============================
# BASE DIR (studymate folder)
# ===============================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# ===============================
# STATIC FILES (JS, CSS)
# ===============================

app.mount(
    "/static",
    StaticFiles(directory=BASE_DIR),
    name="static"
)


# ===============================
# HTML ROUTES
# ===============================

@app.get("/")
def home():
    return FileResponse(os.path.join(BASE_DIR, "INDEX.html"))


@app.get("/login.html")
def login():
    return FileResponse(os.path.join(BASE_DIR, "login.html"))


@app.get("/group.html")
def group():
    return FileResponse(os.path.join(BASE_DIR, "group.html"))


@app.get("/dashboard.html")
def dashboard():
    return FileResponse(os.path.join(BASE_DIR, "dashboard.html"))


@app.get("/planner.html")
def planner():
    return FileResponse(os.path.join(BASE_DIR, "planner.html"))


@app.get("/notes.html")
def notes():
    return FileResponse(os.path.join(BASE_DIR, "notes.html"))


@app.get("/profile.html")
def profile():
    return FileResponse(os.path.join(BASE_DIR, "profile.html"))


# ===============================
# WEBSOCKET
# ===============================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):

    await websocket.accept()

    while True:
        data = await websocket.receive_text()
        await websocket.send_text(data)

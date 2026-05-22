from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
import json
import os
from datetime import datetime

app = FastAPI()

DATA_FILE = os.path.join(os.path.dirname(__file__), "leaderboard.json")


class ScoreEntry(BaseModel):
    name: str
    score: int


class ScoreIn(BaseModel):
    name: str = "Anonymous"
    score: int


def load_scores() -> List[dict]:
    try:
        with open(DATA_FILE) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def save_scores(scores: List[dict]):
    with open(DATA_FILE, "w") as f:
        json.dump(scores, f, indent=2)


@app.get("/api/leaderboard")
def get_leaderboard(all: bool = False):
    scores = load_scores()
    scores.sort(key=lambda s: s["score"], reverse=True)
    return {"scores": scores if all else scores[:20]}


@app.post("/api/leaderboard")
def post_score(body: ScoreIn):
    if body.score < 0:
        raise HTTPException(400, "invalid score")
    entry = {
        "name": body.name[:12] or "Anonymous",
        "score": body.score,
        "date": datetime.utcnow().isoformat()
    }
    scores = load_scores()
    scores.append(entry)
    save_scores(scores)
    return {"success": True}


game_dir = os.path.join(os.path.dirname(__file__), "..", "game")
app.mount("/", StaticFiles(directory=game_dir, html=True), name="game")

if __name__ == "__main__":
    import uvicorn
    import socket
    host = socket.gethostbyname(socket.gethostname())
    print(f"Snake server (FastAPI) running at")
    print(f"  Local:   http://localhost:8000")
    print(f"  Network: http://{host}:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)

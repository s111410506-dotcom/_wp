# Snake Game with Multi-Backend Leaderboard

A classic Snake game with a shared leaderboard, running on four different backend technologies:

- **Node.js** (Express) — port 3001
- **FastAPI** (Python) — port 3002
- **Rust** (Axum) — port 3003
- **Next.js** (React + API Routes) — port 3000

## Quick Start

```bash
# Install game dependencies for each server
cd node-server && npm install && cd ..
pip install -r fastapi-server/requirements.txt
cd rust-server && cargo build && cd ..
cd next-app && npm install && cd ..
```

Run any server, then open `http://localhost:PORT` in your browser:

```bash
# Option 1: Next.js (React + leaderboard API)
cd next-app && npm run dev
# -> http://localhost:3000

# Option 2: Node.js (serves game + leaderboard API)
cd node-server && npm start
# -> http://localhost:3001

# Option 3: FastAPI (serves game + leaderboard API)
cd fastapi-server && uvicorn main:app --port 3002
# -> http://localhost:3002

# Option 4: Rust (serves game + leaderboard API)
cd rust-server && cargo run
# -> http://localhost:3003
```

## How to Play

- Arrow keys or WASD to move the snake
- Eat food (red dot) to grow and score points
- Avoid walls and yourself
- Submit your score to the leaderboard when game ends

## Project Structure

```
midterm/
├── game/                    # Shared snake game (HTML/CSS/JS)
│   ├── index.html
│   ├── style.css
│   └── script.js
├── node-server/             # Node.js + Express backend
│   ├── package.json
│   └── server.js
├── fastapi-server/          # Python FastAPI backend
│   ├── main.py
│   └── requirements.txt
├── rust-server/             # Rust Axum backend
│   ├── Cargo.toml
│   └── src/main.rs
├── next-app/                # Next.js (full-stack)
│   ├── package.json
│   ├── next.config.js
│   └── pages/
│       ├── index.js
│       └── api/leaderboard.js
└── README.md
```

## Leaderboard API

All servers expose the same REST API:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard` | Returns top 20 scores |
| POST | `/api/leaderboard` | Submit score `{ name, score }` |

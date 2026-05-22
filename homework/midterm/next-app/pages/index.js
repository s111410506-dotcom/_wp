import { useEffect, useRef, useState, useCallback } from 'react';

const GRID = 20;
const CELL = 400 / GRID;
const TICK = 150;

export default function Home() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);
  const [overlayTitle, setOverlayTitle] = useState('🐍 SNAKE');
  const [overlayScore, setOverlayScore] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const [showStartBtn, setShowStartBtn] = useState(true);
  const [showRestartBtn, setShowRestartBtn] = useState(false);
  const [scores, setScores] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const nameRef = useRef(null);
  const playerNameRef = useRef('');
  const stateRef = useRef({ snake: [], food: {}, dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 }, score: 0, running: false, over: false });

  const loadLeaderboard = useCallback((all) => {
    const url = all ? '/api/leaderboard?all=true' : '/api/leaderboard';
    fetch(url)
      .then(r => r.json())
      .then(data => {
        const list = data.scores || data || [];
        setScores(all ? list : list.slice(0, 10));
        setLeaderboardLoading(false);
      })
      .catch(() => {
        setLeaderboardLoading(false);
      });
  }, []);

  useEffect(() => {
    const stored = parseInt(localStorage.getItem('snakeBest')) || 0;
    setBest(stored);
    loadLeaderboard(false);
  }, [loadLeaderboard]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;
    ctx.clearRect(0, 0, 400, 400);

    ctx.fillStyle = '#0d0d2b';
    ctx.fillRect(0, 0, 400, 400);

    for (let i = 0; i < GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillStyle = '#0f0f30';
          ctx.fillRect(i * CELL, j * CELL, CELL, CELL);
        }
      }
    }

    s.snake.forEach((seg, i) => {
      const t = i / s.snake.length;
      const r = Math.round(0 + t * 50);
      const g = Math.round(200 + t * 55);
      const b = Math.round(80 - t * 80);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      const pad = 1;
      ctx.fillRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad * 2, CELL - pad * 2);

      if (i === 0) {
        ctx.fillStyle = '#fff';
        const cx = seg.x * CELL + CELL / 2;
        const cy = seg.y * CELL + CELL / 2;
        ctx.beginPath();
        ctx.arc(cx - 3, cy - 3, 2, 0, Math.PI * 2);
        ctx.arc(cx + 3, cy - 3, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.fillStyle = '#ff4466';
    ctx.shadowColor = '#ff4466';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(s.food.x * CELL + CELL / 2, s.food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }, []);

  const spawnFood = useCallback(() => {
    const s = stateRef.current;
    const occupied = new Set(s.snake.map(v => `${v.x},${v.y}`));
    let pos;
    do {
      pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    } while (occupied.has(`${pos.x},${pos.y}`));
    s.food = pos;
  }, []);

  const endGame = useCallback(() => {
    const s = stateRef.current;
    s.over = true;
    s.running = false;
    if (s.gameLoop) clearInterval(s.gameLoop);

    if (s.score > best) {
      const newBest = s.score;
      setBest(newBest);
      localStorage.setItem('snakeBest', newBest);
    }

    setOverlayScore(`Score: ${s.score}`);
    setOverlayTitle(s.score > 10 ? 'Great Job!' : 'Game Over');
    setShowNameInput(false);
    setShowStartBtn(false);
    setShowRestartBtn(true);
    setShowOverlay(true);

    fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: playerNameRef.current, score: s.score })
    }).then(r => r.json()).then(() => {
      loadLeaderboard(showAll);
    }).catch(() => {
      loadLeaderboard(showAll);
    });
  }, [best, loadLeaderboard, showAll]);

  const step = useCallback(() => {
    const s = stateRef.current;
    if (s.over) return;

    s.dir = { ...s.nextDir };
    const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };

    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID || s.snake.some(v => v.x === head.x && v.y === head.y)) {
      endGame();
      return;
    }

    s.snake.unshift(head);
    if (head.x === s.food.x && head.y === s.food.y) {
      s.score++;
      setScore(s.score);
      spawnFood();
    } else {
      s.snake.pop();
    }
    draw();
  }, [draw, endGame, spawnFood]);

  const reset = useCallback(() => {
    const s = stateRef.current;
    const mid = Math.floor(GRID / 2);
    s.snake = [{ x: mid, y: mid }, { x: mid - 1, y: mid }, { x: mid - 2, y: mid }];
    s.dir = { x: 1, y: 0 };
    s.nextDir = { x: 1, y: 0 };
    s.score = 0;
    s.over = false;
    setScore(0);
    spawnFood();
    draw();
  }, [draw, spawnFood]);

  const startGame = () => {
    const name = nameRef.current?.value?.trim();
    if (!name) {
      nameRef.current?.focus();
      nameRef.current.style.borderColor = '#ff4466';
      return;
    }
    nameRef.current.style.borderColor = '#00ff88';
    playerNameRef.current = name;
    setShowOverlay(false);
    reset();
    const s = stateRef.current;
    s.running = true;
    if (s.gameLoop) clearInterval(s.gameLoop);
    s.gameLoop = setInterval(step, TICK);
  };

  const restartGame = () => {
    setOverlayTitle('🐍 SNAKE');
    setOverlayScore('');
    setShowNameInput(true);
    setShowStartBtn(true);
    setShowRestartBtn(false);
    if (nameRef.current) {
      nameRef.current.value = '';
      nameRef.current.placeholder = `Playing as ${playerNameRef.current}`;
      nameRef.current.focus();
    }
    setShowOverlay(true);
    const s = stateRef.current;
    if (s.gameLoop) {
      clearInterval(s.gameLoop);
      s.gameLoop = null;
    }
  };

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      const map = {
        ArrowUp: 0, ArrowDown: 1, ArrowLeft: 2, ArrowRight: 3,
        w: 0, W: 0, s: 1, S: 1, a: 2, A: 2, d: 3, D: 3
      };
      const dir = map[e.key];
      if (dir === undefined) return;
      e.preventDefault();
      const s = stateRef.current;
      if (s.over) return;
      const nd = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }][dir];
      if (!(nd.x === -s.dir.x && nd.y === -s.dir.y)) {
        s.nextDir = nd;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleDir = (e, nd) => {
    e.preventDefault();
    const s = stateRef.current;
    if (s.over) return;
    if (!(nd.x === -s.dir.x && nd.y === -s.dir.y)) {
      s.nextDir = nd;
    }
  };

  const overlayIsStart = showNameInput && showStartBtn;

  return (
    <div className="container">
      <h1>🐍 SNAKE</h1>
      <div className="score-board">
        <div className="score-item">
          <span className="label">Score</span>
          <span className="value">{score}</span>
        </div>
        <div className="score-item">
          <span className="label">Best</span>
          <span className="value">{best}</span>
        </div>
      </div>
      <div className="game-wrapper">
        <canvas ref={canvasRef} id="gameCanvas" width="400" height="400"></canvas>
        <div className={`overlay ${showOverlay ? '' : 'hidden'}`}>
          <div className="overlay-content">
            <h2>{overlayTitle}</h2>
            {overlayIsStart && <p>Enter your name to start</p>}
            {overlayScore && <p>{overlayScore}</p>}
            <div className="name-input-group" style={{ display: showNameInput ? 'flex' : 'none' }}>
              <input ref={nameRef} type="text" placeholder="Your name" maxLength="12" autoComplete="off" />
              <button className="btn primary" style={{ display: showStartBtn ? 'inline-block' : 'none' }} onClick={startGame}>Start Game</button>
            </div>
            <button className="btn primary" style={{ display: showRestartBtn ? 'inline-block' : 'none' }} onClick={restartGame}>Play Again</button>
          </div>
        </div>
      </div>
      <div className="leaderboard">
        <div className="leaderboard-header">
          <h2>Leaderboard</h2>
          <button className="btn small" onClick={() => { const next = !showAll; setShowAll(next); loadLeaderboard(next); }}>{showAll ? 'Top 10' : 'Show All'}</button>
        </div>
        <div className="leaderboard-content">
          {leaderboardLoading ? (
            <p className="loading">Loading...</p>
          ) : scores.length === 0 ? (
            <p className="loading">No scores yet</p>
          ) : (
            scores.map((s, i) => (
              <div key={i} className={`leaderboard-row ${i < 3 ? 'top-' + (i + 1) : ''}`}>
                <span className="rank">#{i + 1}</span>
                <span className="name">{s.name}</span>
                <span className="score">{s.score}</span>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="controls">
        <p>W A S D to move</p>
      </div>
      <div className="dpad">
        <button className="dpad-btn" data-dir="up" onMouseDown={(e) => handleDir(e, {x:0,y:-1})} onTouchStart={(e) => handleDir(e, {x:0,y:-1})}>▲</button>
        <div className="dpad-row">
          <button className="dpad-btn" data-dir="left" onMouseDown={(e) => handleDir(e, {x:-1,y:0})} onTouchStart={(e) => handleDir(e, {x:-1,y:0})}>◀</button>
          <button className="dpad-btn" data-dir="down" onMouseDown={(e) => handleDir(e, {x:0,y:1})} onTouchStart={(e) => handleDir(e, {x:0,y:1})}>▼</button>
          <button className="dpad-btn" data-dir="right" onMouseDown={(e) => handleDir(e, {x:1,y:0})} onTouchStart={(e) => handleDir(e, {x:1,y:0})}>▶</button>
        </div>
      </div>
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 20px;
        }
        h1 {
          font-size: 2rem;
          letter-spacing: 8px;
          color: #00ff88;
          text-shadow: 0 0 20px rgba(0,255,136,0.3);
          margin: 0;
        }
        .score-board {
          display: flex;
          gap: 40px;
        }
        .score-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .score-item .label {
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #888;
          letter-spacing: 2px;
        }
        .score-item .value {
          font-size: 1.8rem;
          font-weight: 700;
          color: #fff;
        }
        .game-wrapper {
          position: relative;
          border: 2px solid #00ff88;
          border-radius: 8px;
          box-shadow: 0 0 30px rgba(0,255,136,0.15);
          overflow: hidden;
        }
        #gameCanvas {
          display: block;
          background: #0d0d2b;
        }
        .overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        .overlay.hidden { display: none; }
        .overlay-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 24px;
        }
        .overlay-content h2 {
          font-size: 1.6rem;
          color: #ff4466;
          text-shadow: 0 0 15px rgba(255,68,102,0.4);
          margin: 0;
        }
        .overlay-content p {
          font-size: 1.1rem;
          color: #ccc;
          margin: 0;
        }
        .name-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
        }
        .name-input-group input {
          padding: 8px 16px;
          border: 2px solid #00ff88;
          border-radius: 6px;
          background: #1a1a3a;
          color: #fff;
          font-size: 1rem;
          text-align: center;
          outline: none;
          width: 200px;
        }
        .name-input-group input:focus {
          box-shadow: 0 0 10px rgba(0,255,136,0.3);
        }
        .btn {
          padding: 8px 20px;
          border: 2px solid #555;
          border-radius: 6px;
          background: transparent;
          color: #ccc;
          font-size: 0.9rem;
          cursor: pointer;
        }
        .btn:hover {
          border-color: #00ff88;
          color: #00ff88;
        }
        .btn.primary {
          border-color: #00ff88;
          color: #00ff88;
          background: rgba(0,255,136,0.1);
        }
        .btn.primary:hover {
          background: rgba(0,255,136,0.2);
        }
        .leaderboard { width: 100%; max-width: 400px; }
        .leaderboard-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .leaderboard-header h2 {
          text-align: center;
          font-size: 1.1rem;
          color: #888;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin: 0;
        }
        .leaderboard-content {
          background: #0d0d2b;
          border: 1px solid #1a1a3a;
          border-radius: 8px;
          padding: 12px;
          min-height: 40px;
        }
        .loading { text-align: center; color: #555; font-size: 0.85rem; }
        .leaderboard-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 8px;
          font-size: 0.9rem;
          border-bottom: 1px solid #1a1a3a;
        }
        .leaderboard-row:last-child { border-bottom: none; }
        .leaderboard-row .rank { color: #555; width: 30px; }
        .leaderboard-row .name { flex: 1; color: #ddd; }
        .leaderboard-row .score { color: #00ff88; font-weight: 600; width: 50px; text-align: right; }
        .controls { color: #555; font-size: 0.8rem; letter-spacing: 1px; }
        .btn.small {
          padding: 4px 12px;
          font-size: 0.75rem;
          border-color: #444;
          color: #999;
        }
        .dpad {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          user-select: none;
          -webkit-user-select: none;
        }
        .dpad-row { display: flex; gap: 6px; }
        .dpad-btn {
          width: 64px; height: 64px;
          border: 2px solid #333;
          border-radius: 12px;
          background: #12122a;
          color: #00ff88;
          font-size: 1.4rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .dpad-btn:active {
          background: #00ff88;
          color: #0a0a1a;
          border-color: #00ff88;
          transform: scale(0.92);
        }
      `}</style>
      <style jsx global>{`
        body {
          margin: 0;
          background: #0a0a1a;
          color: #e0e0e0;
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        #__next {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          width: 100%;
        }
      `}</style>
    </div>
  );
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScore = document.getElementById('overlay-score');
const nameInput = document.getElementById('name-input');
const nameInputGroup = document.getElementById('name-input-group');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const leaderboardContent = document.getElementById('leaderboard-content');

const GRID = 20;
const CELL = canvas.width / GRID;
const TICK = 150;

let snake = [];
let food = {};
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let best = parseInt(localStorage.getItem('snakeBest')) || 0;
let gameLoop = null;
let running = false;
let gameOver = false;
let playerName = '';

bestEl.textContent = best;

function reset() {
    const mid = Math.floor(GRID / 2);
    snake = [
        { x: mid, y: mid },
        { x: mid - 1, y: mid },
        { x: mid - 2, y: mid }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    scoreEl.textContent = '0';
    gameOver = false;
    spawnFood();
    draw();
}

function spawnFood() {
    const occupied = new Set(snake.map(s => `${s.x},${s.y}`));
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * GRID),
            y: Math.floor(Math.random() * GRID)
        };
    } while (occupied.has(`${pos.x},${pos.y}`));
    food = pos;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0d0d2b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < GRID; i++) {
        for (let j = 0; j < GRID; j++) {
            if ((i + j) % 2 === 0) {
                ctx.fillStyle = '#0f0f30';
                ctx.fillRect(i * CELL, j * CELL, CELL, CELL);
            }
        }
    }

    snake.forEach((seg, i) => {
        const t = i / snake.length;
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
            const eyeOff = 3;
            ctx.beginPath();
            ctx.arc(cx - eyeOff, cy - 3, 2, 0, Math.PI * 2);
            ctx.arc(cx + eyeOff, cy - 3, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    ctx.fillStyle = '#ff4466';
    ctx.shadowColor = '#ff4466';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    const fx = food.x * CELL + CELL / 2;
    const fy = food.y * CELL + CELL / 2;
    ctx.arc(fx, fy, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function step() {
    if (gameOver) return;

    direction = { ...nextDirection };

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID ||
        snake.some(s => s.x === head.x && s.y === head.y)) {
        endGame();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreEl.textContent = score;
        spawnFood();
    } else {
        snake.pop();
    }

    draw();
}

function endGame() {
    gameOver = true;
    running = false;
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }

    if (score > best) {
        best = score;
        localStorage.setItem('snakeBest', best);
        bestEl.textContent = best;
    }

    overlayScore.textContent = `Score: ${score}`;
    overlayScore.classList.remove('hidden');
    overlayTitle.textContent = score > 10 ? 'Great Job!' : 'Game Over';
    nameInputGroup.classList.add('hidden');
    startBtn.classList.add('hidden');
    overlayScore.classList.remove('hidden');
    restartBtn.classList.remove('hidden');
    overlay.classList.remove('hidden');

    fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName, score })
    }).then(r => r.json()).then(() => {
        loadLeaderboard();
    }).catch(() => {
        loadLeaderboard();
    });
}

function startGame() {
    const name = nameInput.value.trim();
    if (!name) {
        nameInput.focus();
        nameInput.style.borderColor = '#ff4466';
        return;
    }
    nameInput.style.borderColor = '#00ff88';
    playerName = name;
    overlay.classList.add('hidden');
    reset();
    running = true;
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(step, TICK);
}

function restartGame() {
    overlayTitle.textContent = '🐍 SNAKE';
    overlayScore.classList.add('hidden');
    restartBtn.classList.add('hidden');
    nameInputGroup.classList.remove('hidden');
    startBtn.classList.remove('hidden');
    nameInput.value = '';
    nameInput.placeholder = `Playing as ${playerName}`;
    nameInput.focus();
    overlay.classList.remove('hidden');
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }
}

function loadLeaderboard() {
    const showAll = window._showAll || false;
    fetch('/api/leaderboard' + (showAll ? '?all=true' : ''))
        .then(r => r.json())
        .then(data => {
            const scores = data.scores || data || [];
            if (!scores.length) {
                leaderboardContent.innerHTML = '<p class="loading">No scores yet</p>';
                return;
            }
            leaderboardContent.innerHTML = scores.slice(0, showAll ? scores.length : 10).map((s, i) =>
                `<div class="leaderboard-row${i < 3 ? ' top-' + (i + 1) : ''}">
                    <span class="rank">#${i + 1}</span>
                    <span class="name">${escHtml(s.name)}</span>
                    <span class="score">${s.score}</span>
                </div>`
            ).join('');
        })
        .catch(() => {
            leaderboardContent.innerHTML = '<p class="leaderboard-error">Could not load leaderboard</p>';
        });
}

function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

function handleKey(e) {
    const key = e.key;
    const map = {
        ArrowUp: 0, ArrowDown: 1, ArrowLeft: 2, ArrowRight: 3,
        w: 0, W: 0, s: 1, S: 1, a: 2, A: 2, d: 3, D: 3
    };
    const dir = map[key];
    if (dir === undefined) return;
    e.preventDefault();
    if (gameOver) return;
    const nd = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }][dir];
    if (!(nd.x === -direction.x && nd.y === -direction.y)) {
        nextDirection = nd;
    }
}

window.addEventListener('keydown', handleKey);

let touchStart = null;
canvas.addEventListener('touchstart', (e) => {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
});
canvas.addEventListener('touchmove', (e) => e.preventDefault());
canvas.addEventListener('touchend', (e) => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    let nd;
    if (Math.abs(dx) > Math.abs(dy)) {
        nd = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
    } else {
        nd = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
    }
    if (!(nd.x === -direction.x && nd.y === -direction.y)) {
        nextDirection = nd;
    }
});

startBtn.addEventListener('click', startGame);
nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') startGame(); });

restartBtn.addEventListener('click', restartGame);

document.querySelectorAll('.dpad-btn').forEach(btn => {
    const dirMap = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
    const nd = dirMap[btn.dataset.dir];
    if (!nd) return;

    function setDir(e) {
        e.preventDefault();
        if (!(nd.x === -direction.x && nd.y === -direction.y)) {
            nextDirection = nd;
        }
    }

    btn.addEventListener('mousedown', setDir);
    btn.addEventListener('touchstart', setDir, { passive: false });
});

const showAllBtn = document.getElementById('show-all-btn');
showAllBtn.addEventListener('click', () => {
    window._showAll = !window._showAll;
    showAllBtn.textContent = window._showAll ? 'Top 10' : 'Show All';
    loadLeaderboard();
});

reset();
loadLeaderboard();
nameInput.focus();

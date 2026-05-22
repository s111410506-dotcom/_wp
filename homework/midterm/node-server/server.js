const express = require('express');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'leaderboard.json');

function getLocalIP() {
    const ifaces = os.networkInterfaces();
    for (const name of Object.keys(ifaces)) {
        for (const iface of ifaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) return iface.address;
        }
    }
    return '127.0.0.1';
}

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'game')));

function loadScores() {
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch {
        return [];
    }
}

function saveScores(scores) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(scores, null, 2));
}

app.get('/api/leaderboard', (req, res) => {
    const scores = loadScores();
    scores.sort((a, b) => b.score - a.score);
    const all = req.query.all === 'true';
    res.json({ scores: all ? scores : scores.slice(0, 20) });
});

app.post('/api/leaderboard', (req, res) => {
    const { name, score } = req.body;
    if (typeof score !== 'number' || score < 0) {
        return res.status(400).json({ error: 'invalid score' });
    }
    const entry = {
        name: String(name || 'Anonymous').slice(0, 12),
        score: Math.floor(score),
        date: new Date().toISOString()
    };
    const scores = loadScores();
    scores.push(entry);
    saveScores(scores);
    res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
    const ip = getLocalIP();
    console.log(`Snake server (Node.js) running at`);
    console.log(`  Local:   http://localhost:${PORT}`);
    console.log(`  Network: http://${ip}:${PORT}`);
});

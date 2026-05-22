import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.env.VERCEL ? '/tmp' : process.cwd(), 'leaderboard.json');

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

export default async function handler(req, res) {
  if (req.method === 'GET') {
    let scores;
    try {
      scores = await kv.get('leaderboard') || [];
    } catch {
      scores = loadScores();
    }
    scores.sort((a, b) => b.score - a.score);
    const all = req.query.all === 'true';
    return res.status(200).json({ scores: all ? scores : scores.slice(0, 20) });
  }

  if (req.method === 'POST') {
    const { name, score } = req.body;
    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({ error: 'invalid score' });
    }
    const entry = {
      name: String(name || 'Anonymous').slice(0, 12),
      score: Math.floor(score),
      date: new Date().toISOString()
    };

    try {
      let scores = await kv.get('leaderboard') || [];
      scores.push(entry);
      await kv.set('leaderboard', scores);
    } catch {
      const scores = loadScores();
      scores.push(entry);
      saveScores(scores);
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'method not allowed' });
}

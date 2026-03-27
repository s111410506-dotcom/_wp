const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'blog.db');
let db = null;

async function initDatabase() {
    const SQL = await initSqlJs();
    db = fs.existsSync(DB_PATH) ? new SQL.Database(fs.readFileSync(DB_PATH)) : new SQL.Database();

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    const count = db.exec("SELECT COUNT(*) FROM users")[0];
    if (!count || count.values[0][0] === 0) {
        db.run(`INSERT INTO users (username, password) VALUES ('admin', 'admin123')`);
        db.run(`INSERT INTO posts (title, content, user_id) VALUES ('Welcome', 'First post!', 1)`);
        saveDatabase();
    }
    return db;
}

function saveDatabase() {
    if (db) fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

function getUserByUsername(username) {
    const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
    stmt.bind([username]);
    const user = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    return user;
}

function getUserById(id) {
    const stmt = db.prepare("SELECT id, username, created_at FROM users WHERE id = ?");
    stmt.bind([id]);
    const user = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    return user;
}

function createUser(username, password) {
    try {
        db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, password]);
        saveDatabase();
        const all = db.exec("SELECT * FROM users ORDER BY id DESC LIMIT 1");
        if (all[0] && all[0].values[0]) {
            return all[0].values[0][0];
        }
        return null;
    } catch (e) { 
        console.error('Create user error:', e);
        return null; 
    }
}

function getAllPosts() {
    const posts = [];
    const stmt = db.prepare(`SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC`);
    while (stmt.step()) {
        const row = stmt.getAsObject();
        row.created_at = new Date(row.created_at).toLocaleString('zh-TW');
        posts.push(row);
    }
    stmt.free();
    return posts;
}

function getPostById(id) {
    const stmt = db.prepare(`SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = ?`);
    stmt.bind([id]);
    const post = stmt.step() ? stmt.getAsObject() : null;
    if (post) post.created_at = new Date(post.created_at).toLocaleString('zh-TW');
    stmt.free();
    return post;
}

function createPost(title, content, userId) {
    db.run("INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)", [title, content, userId]);
    saveDatabase();
}

function updatePost(id, title, content, userId) {
    db.run("UPDATE posts SET title = ?, content = ? WHERE id = ? AND user_id = ?", [title, content, id, userId]);
    saveDatabase();
}

function deletePost(id, userId) {
    db.run("DELETE FROM posts WHERE id = ? AND user_id = ?", [id, userId]);
    saveDatabase();
}

module.exports = { initDatabase, getUserByUsername, getUserById, createUser, getAllPosts, getPostById, createPost, updatePost, deletePost };

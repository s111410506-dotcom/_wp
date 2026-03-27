const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'blog.db');

let db = null;

async function initDatabase() {
    const SQL = await initSqlJs();
    
    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    const userCount = db.exec("SELECT COUNT(*) as count FROM users")[0];
    if (userCount && userCount.values[0][0] === 0) {
        db.run(`INSERT INTO users (username, password) VALUES ('admin', 'admin123')`);
        db.run(`INSERT INTO posts (title, content, user_id) VALUES ('Welcome to My Blog', 'This is your first blog post! Start writing by creating new posts.', 1)`);
        db.run(`INSERT INTO posts (title, content, user_id) VALUES ('Getting Started', 'This blog is built with Node.js and SQLite. You can register a new account to start posting.', 1)`);
        saveDatabase();
    }

    return db;
}

function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
    }
}

function getUserByUsername(username) {
    const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
    stmt.bind([username]);
    let user = null;
    if (stmt.step()) {
        user = stmt.getAsObject();
    }
    stmt.free();
    return user;
}

function getUserById(id) {
    const stmt = db.prepare("SELECT id, username, created_at FROM users WHERE id = ?");
    stmt.bind([id]);
    let user = null;
    if (stmt.step()) {
        user = stmt.getAsObject();
    }
    stmt.free();
    return user;
}

function createUser(username, password) {
    try {
        db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, password]);
        saveDatabase();
        return db.exec("SELECT last_insert_rowid()")[0].values[0][0];
    } catch (e) {
        return null;
    }
}

function getAllPosts() {
    const stmt = db.prepare(`
        SELECT posts.*, users.username 
        FROM posts 
        JOIN users ON posts.user_id = users.id 
        ORDER BY posts.created_at DESC
    `);
    const posts = [];
    while (stmt.step()) {
        const row = stmt.getAsObject();
        row.created_at = new Date(row.created_at).toLocaleString('zh-TW');
        posts.push(row);
    }
    stmt.free();
    return posts;
}

function getPostById(id) {
    const stmt = db.prepare(`
        SELECT posts.*, users.username 
        FROM posts 
        JOIN users ON posts.user_id = users.id 
        WHERE posts.id = ?
    `);
    stmt.bind([id]);
    let post = null;
    if (stmt.step()) {
        post = stmt.getAsObject();
        post.created_at = new Date(post.created_at).toLocaleString('zh-TW');
    }
    stmt.free();
    return post;
}

function createPost(title, content, userId) {
    db.run("INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)", [title, content, userId]);
    saveDatabase();
    return db.exec("SELECT last_insert_rowid()")[0].values[0][0];
}

function updatePost(id, title, content, userId) {
    db.run("UPDATE posts SET title = ?, content = ? WHERE id = ? AND user_id = ?", [title, content, id, userId]);
    saveDatabase();
}

function deletePost(id, userId) {
    db.run("DELETE FROM posts WHERE id = ? AND user_id = ?", [id, userId]);
    saveDatabase();
}

module.exports = {
    initDatabase,
    getUserByUsername,
    getUserById,
    createUser,
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost
};

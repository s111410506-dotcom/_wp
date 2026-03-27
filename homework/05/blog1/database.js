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
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    const count = db.exec("SELECT COUNT(*) as count FROM posts")[0];
    if (count && count.values[0][0] === 0) {
        db.run(`
            INSERT INTO posts (title, content) VALUES 
            ('Welcome to My Blog', 'This is your first blog post! Start writing by creating new posts.'),
            ('Getting Started', 'This blog is built with Node.js and SQLite. Simple and lightweight.')
        `);
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

function getAllPosts() {
    const stmt = db.prepare("SELECT * FROM posts ORDER BY created_at DESC");
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
    const stmt = db.prepare("SELECT * FROM posts WHERE id = ?");
    stmt.bind([id]);
    let post = null;
    if (stmt.step()) {
        post = stmt.getAsObject();
        post.created_at = new Date(post.created_at).toLocaleString('zh-TW');
    }
    stmt.free();
    return post;
}

function createPost(title, content) {
    db.run("INSERT INTO posts (title, content) VALUES (?, ?)", [title, content]);
    saveDatabase();
    return db.exec("SELECT last_insert_rowid()")[0].values[0][0];
}

function updatePost(id, title, content) {
    db.run("UPDATE posts SET title = ?, content = ? WHERE id = ?", [title, content, id]);
    saveDatabase();
}

function deletePost(id) {
    db.run("DELETE FROM posts WHERE id = ?", [id]);
    saveDatabase();
}

module.exports = {
    initDatabase,
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost
};

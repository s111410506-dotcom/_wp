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
        bio TEXT DEFAULT '',
        avatar TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        is_public INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS follows (
        follower_id INTEGER NOT NULL,
        following_id INTEGER NOT NULL,
        PRIMARY KEY (follower_id, following_id),
        FOREIGN KEY (follower_id) REFERENCES users(id),
        FOREIGN KEY (following_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS likes (
        user_id INTEGER NOT NULL,
        post_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, post_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (post_id) REFERENCES posts(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    const count = db.exec("SELECT COUNT(*) FROM users")[0];
    if (!count || count.values[0][0] === 0) {
        db.run(`INSERT INTO users (username, password, bio) VALUES ('admin', 'admin123', 'Hello world!')`);
        db.run(`INSERT INTO users (username, password, bio) VALUES ('alice', 'alice123', 'Fashion lover')`);
        db.run(`INSERT INTO users (username, password, bio) VALUES ('bob', 'bob123', 'Tech enthusiast')`);
        db.run(`INSERT INTO posts (content, user_id, is_public) VALUES ('Just launched my new project! 🚀', 1, 1)`);
        db.run(`INSERT INTO posts (content, user_id, is_public) VALUES ('This is my private note to self 📝', 1, 0)`);
        db.run(`INSERT INTO posts (content, user_id, is_public) VALUES ('Beautiful sunset today 🌅', 2, 1)`);
        db.run(`INSERT INTO posts (content, user_id, is_public) VALUES ('Coding late night 💻', 3, 1)`);
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
    const stmt = db.prepare("SELECT id, username, bio, avatar, created_at FROM users WHERE id = ?");
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
        return null; 
    }
}

function updateUserBio(userId, bio) {
    db.run("UPDATE users SET bio = ? WHERE id = ?", [bio, userId]);
    saveDatabase();
}

function getAllPublicPosts() {
    const posts = [];
    const stmt = db.prepare(`
        SELECT posts.*, users.username, users.avatar 
        FROM posts 
        JOIN users ON posts.user_id = users.id 
        WHERE posts.is_public = 1 
        ORDER BY posts.created_at DESC
    `);
    while (stmt.step()) {
        const row = stmt.getAsObject();
        row.created_at = formatDate(row.created_at);
        posts.push(row);
    }
    stmt.free();
    return posts;
}

function getUserPosts(userId) {
    const posts = [];
    const stmt = db.prepare(`
        SELECT posts.*, users.username, users.avatar 
        FROM posts 
        JOIN users ON posts.user_id = users.id 
        WHERE posts.user_id = ? 
        ORDER BY posts.created_at DESC
    `);
    stmt.bind([userId]);
    while (stmt.step()) {
        const row = stmt.getAsObject();
        row.created_at = formatDate(row.created_at);
        posts.push(row);
    }
    stmt.free();
    return posts;
}

function getFollowingPosts(userId) {
    const posts = [];
    const stmt = db.prepare(`
        SELECT posts.*, users.username, users.avatar 
        FROM posts 
        JOIN users ON posts.user_id = users.id 
        JOIN follows ON follows.following_id = posts.user_id 
        WHERE follows.follower_id = ? 
        ORDER BY posts.created_at DESC
    `);
    stmt.bind([userId]);
    while (stmt.step()) {
        const row = stmt.getAsObject();
        row.created_at = formatDate(row.created_at);
        posts.push(row);
    }
    stmt.free();
    return posts;
}

function getFollowers(userId) {
    const stmt = db.prepare(`
        SELECT users.id, users.username, users.bio, users.avatar 
        FROM users 
        JOIN follows ON follows.follower_id = users.id 
        WHERE follows.following_id = ?
    `);
    stmt.bind([userId]);
    const followers = [];
    while (stmt.step()) followers.push(stmt.getAsObject());
    stmt.free();
    return followers;
}

function getFollowing(userId) {
    const stmt = db.prepare(`
        SELECT users.id, users.username, users.bio, users.avatar 
        FROM users 
        JOIN follows ON follows.following_id = users.id 
        WHERE follows.follower_id = ?
    `);
    stmt.bind([userId]);
    const following = [];
    while (stmt.step()) following.push(stmt.getAsObject());
    stmt.free();
    return following;
}

function follow(followerId, followingId) {
    try {
        db.run("INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)", [followerId, followingId]);
        saveDatabase();
        return true;
    } catch { return false; }
}

function unfollow(followerId, followingId) {
    db.run("DELETE FROM follows WHERE follower_id = ? AND following_id = ?", [followerId, followingId]);
    saveDatabase();
}

function isFollowing(followerId, followingId) {
    const stmt = db.prepare("SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?");
    stmt.bind([followerId, followingId]);
    const result = stmt.step();
    stmt.free();
    return result;
}

function getPostById(id) {
    const stmt = db.prepare(`
        SELECT posts.*, users.username, users.avatar 
        FROM posts 
        JOIN users ON posts.user_id = users.id 
        WHERE posts.id = ?
    `);
    stmt.bind([id]);
    const post = stmt.step() ? stmt.getAsObject() : null;
    if (post) post.created_at = formatDate(post.created_at);
    stmt.free();
    return post;
}

function createPost(content, userId, isPublic = true) {
    db.run("INSERT INTO posts (content, user_id, is_public) VALUES (?, ?, ?)", [content, userId, isPublic ? 1 : 0]);
    saveDatabase();
}

function updatePost(id, content, userId) {
    db.run("UPDATE posts SET content = ? WHERE id = ? AND user_id = ?", [content, id, userId]);
    saveDatabase();
}

function deletePost(id, userId) {
    db.run("DELETE FROM posts WHERE id = ? AND user_id = ?", [id, userId]);
    saveDatabase();
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = (now - date) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return date.toLocaleDateString('zh-TW');
}

function getAllUsers() {
    const stmt = db.prepare("SELECT id, username, bio, avatar, created_at FROM users ORDER BY created_at DESC");
    const users = [];
    while (stmt.step()) users.push(stmt.getAsObject());
    stmt.free();
    return users;
}

function likePost(userId, postId) {
    try {
        db.run("INSERT OR IGNORE INTO likes (user_id, post_id) VALUES (?, ?)", [userId, postId]);
        saveDatabase();
        return true;
    } catch { return false; }
}

function unlikePost(userId, postId) {
    db.run("DELETE FROM likes WHERE user_id = ? AND post_id = ?", [userId, postId]);
    saveDatabase();
}

function isLiked(userId, postId) {
    const stmt = db.prepare("SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?");
    stmt.bind([userId, postId]);
    const result = stmt.step();
    stmt.free();
    return result;
}

function getLikesCount(postId) {
    const stmt = db.prepare("SELECT COUNT(*) FROM likes WHERE post_id = ?");
    stmt.bind([postId]);
    stmt.step();
    const count = stmt.get()[0];
    stmt.free();
    return count;
}

function getComments(postId) {
    const comments = [];
    const stmt = db.prepare(`
        SELECT comments.*, users.username 
        FROM comments 
        JOIN users ON comments.user_id = users.id 
        WHERE comments.post_id = ? 
        ORDER BY comments.created_at ASC
    `);
    stmt.bind([postId]);
    while (stmt.step()) {
        const row = stmt.getAsObject();
        row.created_at = formatDate(row.created_at);
        comments.push(row);
    }
    stmt.free();
    return comments;
}

function addComment(postId, userId, content) {
    db.run("INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)", [postId, userId, content]);
    saveDatabase();
}

function getCommentsCount(postId) {
    const stmt = db.prepare("SELECT COUNT(*) FROM comments WHERE post_id = ?");
    stmt.bind([postId]);
    stmt.step();
    const count = stmt.get()[0];
    stmt.free();
    return count;
}

module.exports = { 
    initDatabase, getUserByUsername, getUserById, createUser, updateUserBio,
    getAllPublicPosts, getUserPosts, getFollowingPosts,
    getFollowers, getFollowing, follow, unfollow, isFollowing,
    getPostById, createPost, updatePost, deletePost, getAllUsers,
    likePost, unlikePost, isLiked, getLikesCount, getComments, addComment, getCommentsCount
};

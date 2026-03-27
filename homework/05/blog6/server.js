const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'threads-clone-secret-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

function requireAuth(req, res, next) {
    if (!req.session.userId) return res.redirect('/login');
    next();
}

function getCurrentUser(req) {
    if (!req.session.userId) return null;
    const user = db.getUserById(req.session.userId);
    if (!user) return null;
    user.followers = db.getFollowers(user.id).length;
    user.following = db.getFollowing(user.id).length;
    user.posts = db.getUserPosts(user.id).length;
    return user;
}

app.get('/', (req, res) => {
    const user = getCurrentUser(req);
    const publicPosts = db.getAllPublicPosts();
    const allUsers = db.getAllUsers();
    let myPosts = [];
    let followingPosts = [];
    
    if (user) {
        myPosts = db.getUserPosts(user.id);
        followingPosts = db.getFollowingPosts(user.id);
    }
    
    res.render('index', { 
        user, 
        publicPosts, 
        myPosts,
        followingPosts,
        allUsers,
        error: null 
    });
});

app.get('/explore', (req, res) => {
    const user = getCurrentUser(req);
    const publicPosts = db.getAllPublicPosts();
    const users = db.getAllUsers();
    res.render('explore', { user, publicPosts, users });
});

app.get('/profile/:id', (req, res) => {
    const profileUser = db.getUserById(parseInt(req.params.id));
    if (!profileUser) return res.status(404).send('User not found');
    
    const user = getCurrentUser(req);
    const posts = db.getUserPosts(profileUser.id);
    const followers = db.getFollowers(profileUser.id);
    const following = db.getFollowing(profileUser.id);
    
    profileUser.followers = followers.length;
    profileUser.following = following.length;
    profileUser.posts = posts.length;
    
    const isFollowingUser = user && profileUser.id !== user.id ? db.isFollowing(user.id, profileUser.id) : false;
    
    res.render('profile', { user, profileUser, posts, followers, following, isFollowingUser });
});

app.get('/post/:id', (req, res) => {
    const post = db.getPostById(parseInt(req.params.id));
    if (!post) return res.status(404).send('Post not found');
    const user = getCurrentUser(req);
    res.render('post', { post, user });
});

app.get('/new', requireAuth, (req, res) => {
    res.render('new', { user: getCurrentUser(req) });
});

app.post('/create', requireAuth, (req, res) => {
    const { content, is_public } = req.body;
    if (content) {
        db.createPost(content, req.session.userId, is_public === '1');
    }
    res.redirect('/');
});

app.get('/edit/:id', requireAuth, (req, res) => {
    const post = db.getPostById(parseInt(req.params.id));
    if (!post) return res.status(404).send('Post not found');
    if (post.user_id !== req.session.userId) return res.status(403).send('Forbidden');
    res.render('edit', { post, user: getCurrentUser(req) });
});

app.post('/update', requireAuth, (req, res) => {
    const { id, content } = req.body;
    if (id && content) db.updatePost(parseInt(id), content, req.session.userId);
    res.redirect('/');
});

app.post('/delete', requireAuth, (req, res) => {
    if (req.body.id) db.deletePost(parseInt(req.body.id), req.session.userId);
    res.redirect('/');
});

app.post('/follow', requireAuth, (req, res) => {
    const { user_id } = req.body;
    if (user_id && parseInt(user_id) !== req.session.userId) {
        db.follow(req.session.userId, parseInt(user_id));
    }
    res.redirect('back');
});

app.post('/unfollow', requireAuth, (req, res) => {
    const { user_id } = req.body;
    if (user_id) {
        db.unfollow(req.session.userId, parseInt(user_id));
    }
    res.redirect('back');
});

app.get('/register', (req, res) => {
    if (req.session.userId) return res.redirect('/');
    res.render('register', { error: null });
});

app.post('/register', (req, res) => {
    const { username, password, confirmPassword } = req.body;
    if (!username || !password) return res.render('register', { error: 'Please fill all fields' });
    if (password !== confirmPassword) return res.render('register', { error: 'Passwords do not match' });
    if (password.length < 4) return res.render('register', { error: 'Password must be at least 4 characters' });
    if (db.getUserByUsername(username)) return res.render('register', { error: 'Username already exists' });
    const userId = db.createUser(username, password);
    if (userId) {
        req.session.userId = userId;
        res.redirect('/');
    } else {
        res.render('register', { error: 'Registration failed' });
    }
});

app.get('/login', (req, res) => {
    if (req.session.userId) return res.redirect('/');
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.getUserByUsername(username);
    if (user && user.password === password) {
        req.session.userId = user.id;
        res.redirect('/');
    } else {
        res.render('login', { error: 'Invalid username or password' });
    }
});

app.get('/logout', (req, res) => {
    req.session.userId = null;
    req.session.destroy(() => {
        res.redirect('/');
    });
});

async function start() {
    await db.initDatabase();
    app.listen(PORT, () => console.log(`gogogo running at http://localhost:${PORT}`));
}

start();

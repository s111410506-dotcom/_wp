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
    secret: 'blog-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

function requireAuth(req, res, next) {
    if (!req.session.userId) return res.redirect('/login');
    next();
}

function getCurrentUser(req) {
    return req.session.userId ? db.getUserById(req.session.userId) : null;
}

app.get('/', (req, res) => {
    res.render('index', { posts: db.getAllPosts(), user: getCurrentUser(req), error: null });
});

app.get('/post/:id', (req, res) => {
    const post = db.getPostById(parseInt(req.params.id));
    if (!post) return res.status(404).send('Post not found');
    res.render('post', { post, user: getCurrentUser(req) });
});

app.get('/new', requireAuth, (req, res) => {
    res.render('new', { user: getCurrentUser(req) });
});

app.post('/create', requireAuth, (req, res) => {
    const { title, content } = req.body;
    if (title && content) db.createPost(title, content, req.session.userId);
    res.redirect('/');
});

app.get('/edit/:id', requireAuth, (req, res) => {
    const post = db.getPostById(parseInt(req.params.id));
    if (!post) return res.status(404).send('Post not found');
    if (post.user_id !== req.session.userId) return res.status(403).send('Forbidden');
    res.render('edit', { post, user: getCurrentUser(req) });
});

app.post('/update', requireAuth, (req, res) => {
    const { id, title, content } = req.body;
    if (id && title && content) db.updatePost(parseInt(id), title, content, req.session.userId);
    res.redirect('/');
});

app.post('/delete', requireAuth, (req, res) => {
    if (req.body.id) db.deletePost(parseInt(req.body.id), req.session.userId);
    res.redirect('/');
});

app.get('/register', (req, res) => {
    if (req.session.userId) return res.redirect('/');
    res.render('register', { error: null });
});

app.post('/register', (req, res) => {
    const { username, password, confirmPassword } = req.body;
    console.log('1. Register attempt:', username);
    console.log('2. Body:', req.body);
    if (!username || !password) return res.render('register', { error: 'Please fill all fields' });
    if (password !== confirmPassword) return res.render('register', { error: 'Passwords do not match' });
    if (password.length < 4) return res.render('register', { error: 'Password must be at least 4 characters' });
    const existing = db.getUserByUsername(username);
    console.log('3. Existing user:', existing);
    if (existing) return res.render('register', { error: 'Username already exists' });
    console.log('4. Creating user...');
    const userId = db.createUser(username, password);
    console.log('5. User created, id:', userId, 'type:', typeof userId);
    if (userId) {
        req.session.userId = userId;
        console.log('6. Session set, redirecting...');
        res.redirect('/');
    } else {
        console.log('6. FAIL - rendering error');
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
    app.listen(PORT, () => console.log(`Blog running at http://localhost:${PORT}`));
}

start();

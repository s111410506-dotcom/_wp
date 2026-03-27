const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    const posts = db.getAllPosts();
    res.render('index', { posts });
});

app.get('/post/:id', (req, res) => {
    const post = db.getPostById(parseInt(req.params.id));
    if (!post) {
        return res.status(404).send('Post not found');
    }
    res.render('post', { post });
});

app.get('/new', (req, res) => {
    res.render('new');
});

app.post('/create', (req, res) => {
    const { title, content } = req.body;
    if (title && content) {
        db.createPost(title, content);
    }
    res.redirect('/');
});

app.get('/edit/:id', (req, res) => {
    const post = db.getPostById(parseInt(req.params.id));
    if (!post) {
        return res.status(404).send('Post not found');
    }
    res.render('edit', { post });
});

app.post('/update', (req, res) => {
    const { id, title, content } = req.body;
    if (id && title && content) {
        db.updatePost(parseInt(id), title, content);
    }
    res.redirect('/');
});

app.post('/delete', (req, res) => {
    const { id } = req.body;
    if (id) {
        db.deletePost(parseInt(id));
    }
    res.redirect('/');
});

async function start() {
    await db.initDatabase();
    app.listen(PORT, () => {
        console.log(`Blog running at http://localhost:${PORT}`);
    });
}

start();

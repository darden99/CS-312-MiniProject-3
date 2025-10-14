import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import pool from './db.js';

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: true
}));

app.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM blogs ORDER BY date_created DESC;');
  res.render('index', { posts: result.rows, user: req.session.user });
});

app.get('/signup', (req, res) => res.render('signup'));

app.post('/signup', async (req, res) => {
  const { user_id, password, name } = req.body;
  const existing = await pool.query('SELECT * FROM users WHERE user_id = $1;', [user_id]);
  if (existing.rows.length > 0) {
    return res.send('User ID already taken.');
  }
  await pool.query('INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3);', [user_id, password, name]);
  res.redirect('/login');
});

app.get('/login', (req, res) => res.render('login'));

app.post('/login', async (req, res) => {
  const { user_id, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE user_id = $1 AND password = $2;', [user_id, password]);
  if (result.rows.length === 0) {
    return res.send('Invalid login.');
  }
  req.session.user = result.rows[0];
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

app.get('/new', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('new-post');
});

app.post('/new', async (req, res) => {
  const { title, body } = req.body;
  const user = req.session.user;
  if (!user) return res.redirect('/login');

  await pool.query(
    'INSERT INTO blogs (creator_name, creator_user_id, title, body) VALUES ($1, $2, $3, $4);',
    [user.name, user.user_id, title, body]
  );
  res.redirect('/');
});

app.get('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const post = await pool.query('SELECT * FROM blogs WHERE blog_id = $1;', [id]);
  res.render('edit-post', { post: post.rows[0] });
});

app.post('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { title, body } = req.body;
  await pool.query('UPDATE blogs SET title = $1, body = $2 WHERE blog_id = $3;', [title, body, id]);
  res.redirect('/');
});

app.post('/delete/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM blogs WHERE blog_id = $1;', [id]);
  res.redirect('/');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'aflive123', resave: true, saveUninitialized: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const admin = { username: 'admin', password: '12345' };

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === admin.username && password === admin.password) {
    req.session.loggedIn = true;
    res.redirect('/admin.html');
  } else {
    res.send('Invalid login');
  }
});

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.session.loggedIn) return res.status(403).send('Unauthorized');

  const news = {
    title: req.body.title,
    content: req.body.content,
    imageUrl: '/uploads/' + req.file.filename,
    timestamp: new Date()
  };

  const data = fs.existsSync('news.json') ? JSON.parse(fs.readFileSync('news.json', 'utf8')) : [];
  data.unshift(news);
  fs.writeFileSync('news.json', JSON.stringify(data, null, 2));
  res.redirect('/admin.html');
});

app.get('/api/news', (req, res) => {
  const data = fs.existsSync('news.json') ? JSON.parse(fs.readFileSync('news.json', 'utf8')) : [];
  res.json(data);
});

app.listen(PORT, () => console.log(`AF LIVE running on port ${PORT}`));

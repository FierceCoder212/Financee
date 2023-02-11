const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');

const app = express();

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// view engine
app.set('view engine', 'ejs');


mongoose.connect('mongodb://127.0.0.1:27017/finance', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then((result) =>
 app.listen(3000, function () {
  console.log('MongoDB Connection Succeeded.');
  console.log('Server is started on http://127.0.0.1:'+3000);
}))
 .catch((err) => console.error(err));

// routes
app.get('*', checkUser);
app.use(authRoutes);


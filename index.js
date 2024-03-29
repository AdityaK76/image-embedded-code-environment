const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const passportServices = require('./services/passport');
const keys = require('./config/keys');
const User = require('./models/User');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieSession = require('cookie-session');
const connectDB = require('./config/db');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

connectDB().then(console.log('Database connected!'));

// passport
passportServices(keys, User, GoogleStrategy, passport);

app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey],
  })
);

app.use(passport.initialize());
app.use(passport.session());

// routes
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/images'));

if (process.env.NODE_ENV === 'production') {
  // Express will serve up production assets
  // like our main.js file or main.css file
  app.use(express.static('client/build'));

  // Express will serve up the index.html file
  // if it doesn't recognize the route
  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

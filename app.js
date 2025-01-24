const express = require('express')
const createHttpError = require('http-errors')
const morgan = require('morgan')
require('dotenv').config();
const session = require('express-session')
const connectFlash = require('connect-flash')
const passport = require('passport')
const { ensureLoggedIn } = require('connect-ensure-login');

// Initialization
const app = express();
app.use(morgan('dev'));
app.set('view engine', 'pug'); 
app.set('views', __dirname + '/views'); 
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Init Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
    },
  })
);

// For Passport JS Authentication
app.use(passport.initialize());
app.use(passport.session());
require('./utils/passport.auth');
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

//Flash messages
app.use(connectFlash())
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// Routes
app.use('/', require('./routes/index.route'));
app.use('/auth', require('./routes/auth.route'));
app.use(
  '/user', 
  ensureLoggedIn({ redirectTo: '/auth/login' }),
  require('./routes/user.route'));
app.use(
  '/admin', 
  ensureLoggedIn({ redirectTo: '/auth/login' }),
  require('./routes/admin.route'))
app.use('/manager',
  ensureLoggedIn({ redirectTo: '/auth/login' }),
  require('./routes/manager.route'));
app.use('/waiter', 
  ensureLoggedIn({ redirectTo: '/auth/login' }),
  require('./routes/waiter.route'));

// 404 Handler
app.use((req, res, next) => {
    next(createHttpError.NotFound());
  });
  
// Error Handler
app.use((error, req, res, next) => {
  error.status = error.status || 500;
  res.status(error.status);
  res.render('error_40x', { error });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });





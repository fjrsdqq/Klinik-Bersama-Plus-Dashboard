// === IMPORT MODULE UTAMA ===
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config(); // Load .env

const db = require('./db'); // Koneksi ke MySQL

const app = express();
const PORT = 3000;

// === MIDDLEWARE UMUM ===
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// === SESSION SETUP ===
app.use(session({
    secret: 'klinikbersama123',
    resave: false,
    saveUninitialized: true,
}));

// === PASSPORT GOOGLE AUTH ===
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    const user = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        gender: '',
        birthdate: ''
    };
    return done(null, user);
}));

// === GLOBAL MIDDLEWARE UNTUK VIEW ===
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// === AUTH ROUTES ===
app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));
app.get('/forgot-password', (req, res) => res.render('forgot-password'));

// NOTE: Hapus semua post /login dan /register dari app.js,
// karena sudah ditangani di routes/index.js secara lengkap ✅

// Google OAuth
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        req.session.user = req.user;
        res.redirect('/dashboard');
    }
);

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// === ROUTER UTAMA (semua logic utama di sini) ===
const mainRouter = require('./routes/index');
app.use('/', mainRouter);

// === JALANKAN SERVER ===
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});

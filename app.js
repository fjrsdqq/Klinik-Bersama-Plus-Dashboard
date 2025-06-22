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
    // Simpan hanya data penting ke session
    const user = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        gender: '', // default kosong
        birthdate: ''
    };
    return done(null, user);
}));

// === GLOBAL MIDDLEWARE UNTUK VIEW (agar <%= user %> tersedia) ===
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// === AUTH ROUTES (Login/Register/Forgot) ===
app.get('/', (req, res) => res.redirect('/login'));

// Login Form
app.get('/login', (req, res) => res.render('login'));

// Login Proses
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, results) => {
        if (err) return res.send('❌ Terjadi kesalahan server.');
        if (results.length > 0) {
            req.session.user = results[0];
            res.redirect('/dashboard');
        } else {
            res.send('⚠️ Email atau password salah.');
        }
    });
});

// Register Form
app.get('/register', (req, res) => res.render('register'));

// Register Proses
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(sql, [name, email, password], (err) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.send('⚠️ Email sudah terdaftar.');
            }
            return res.send('❌ Gagal menyimpan data.');
        }
        res.redirect('/login');
    });
});

// Google OAuth
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        req.session.user = req.user; // Simpan data dari Google ke session
        res.redirect('/dashboard');
    }
);

// Forgot Password
app.get('/forgot-password', (req, res) => res.render('forgot-password'));

app.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    res.send(`🔐 Tautan reset telah dikirim ke email: ${email}`);
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// === ROUTER UTAMA (untuk semua halaman dengan sidebar) ===
const mainRouter = require('./routes/index');
app.use('/', mainRouter);

// === JALANKAN SERVER ===
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
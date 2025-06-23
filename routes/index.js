// === IMPORT MODULE ===
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

// =========================
// ROUTE: REGISTER (TAMBAHAN)
// =========================
router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  // Cek apakah email sudah terdaftar
  const sqlCheck = 'SELECT * FROM users WHERE email = ?';
  db.query(sqlCheck, [email], (err, results) => {
    if (err) return res.send('❌ Terjadi kesalahan server.');
    if (results.length > 0) return res.send('⚠️ Email sudah terdaftar.');

    // Hash password sebelum disimpan
    bcrypt.hash(password, 10, (errHash, hashedPassword) => {
      if (errHash) return res.send('❌ Gagal mengenkripsi password.');

      const sqlInsert = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
      db.query(sqlInsert, [name, email, hashedPassword], (errInsert) => {
        if (errInsert) return res.send('❌ Gagal menyimpan user.');
        res.redirect('/login');
      });
    });
  });
});

// =========================
// ROUTE: LOGIN
// =========================
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err || results.length === 0) {
      return res.render('login', { error: '⚠️ Email atau password salah.' });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (errCompare, isMatch) => {
      if (errCompare || !isMatch) {
        return res.render('login', { error: '⚠️ Email atau password salah.' });
      }

      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email
      };

      res.redirect('/dashboard');
    });
  });
});

// =========================
// ROUTE: DASHBOARD
// =========================
router.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  res.render('dashboard', {
    activePage: 'dashboard',
    chartData: [],
    avgCholesterol: 0,
    avgBloodSugar: 0,
    avgUricAcid: 0,
    lastUpdate: '-',
    thisWeekCount: 0,
    lastTension: '-',
    search: ''
  });
});

// =========================
// ROUTE: DASHBOARD SEARCH (AJAX)
// =========================
router.get('/dashboard/search', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

  const search = req.query.search || '';
  const query = `
    SELECT * FROM medical_data
    WHERE username LIKE ? OR tanggal LIKE ?
    ORDER BY tanggal DESC
  `;
  const values = [`%${search}%`, `%${search}%`];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('❌ Gagal mengambil data:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const data = results;
    const avg = (key) =>
      data.length
        ? (data.reduce((sum, d) => sum + Number(d[key] || 0), 0) / data.length).toFixed(1)
        : 0;

    const response = {
      chartData: data,
      avgCholesterol: avg('cholesterol'),
      avgBloodSugar: avg('blood_sugar'),
      avgUricAcid: avg('uric_acid'),
      lastUpdate: data.length ? new Date(data[0].tanggal).toLocaleDateString('id-ID') : '-',
      lastTension: data.length ? data[0].tension : '-',
      thisWeekCount: data.filter(d => {
        const today = new Date();
        const recordDate = new Date(d.tanggal);
        const diffDays = (today - recordDate) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      }).length
    };

    res.json(response);
  });
});

// =========================
// ROUTE: MEDICAL DATA FORM
// =========================
router.get('/medical-data', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  res.render('medical-form', {
    activePage: 'medical'
  });
});

router.post('/medical-data', (req, res) => {
  const {
    username,
    address,
    birthdate,
    check_time,
    tension,
    blood_sugar,
    cholesterol,
    uric_acid,
    result
  } = req.body;

  const sql = `
    INSERT INTO medical_data (
      username, address, birthdate, check_time, tension,
      blood_sugar, cholesterol, uric_acid, result, tanggal
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  const values = [
    username, address, birthdate, check_time, tension,
    blood_sugar, cholesterol, uric_acid, result
  ];

  db.query(sql, values, (err) => {
    if (err) {
      console.error('❌ Gagal menyimpan data medical_data:', err);
      return res.status(500).send('Gagal menyimpan data.');
    }

    console.log('✅ Medical data lengkap berhasil disimpan:', req.body);
    res.redirect('/dashboard');
  });
});

// =========================
// ROUTE: PROFILE - EDIT
// =========================
router.get('/profile', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const sql = 'SELECT * FROM users WHERE id = ?';
  db.query(sql, [req.session.user.id], (err, results) => {
    if (err || results.length === 0) {
      console.error('❌ Gagal mengambil data user:', err);
      return res.status(500).send('Gagal mengambil data user.');
    }

    res.render('profile', {
      activePage: 'profile',
      activeTab: 'edit',
      user: results[0]
    });
  });
});

// =========================
// ROUTE: PERSONAL INFO
// =========================
router.get('/profile/personal', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const sql = 'SELECT * FROM users WHERE id = ?';
  db.query(sql, [req.session.user.id], (err, results) => {
    if (err || results.length === 0) {
      console.error('❌ Gagal mengambil data personal info:', err);
      return res.status(500).send('Gagal mengambil data personal info.');
    }

    res.render('personal-info', {
      activePage: 'profile',
      activeTab: 'personal',
      user: results[0]
    });
  });
});

// =========================
// ROUTE: CHANGE PASSWORD
// =========================
router.get('/profile/change-password', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  res.render('change-password', {
    activePage: 'profile',
    activeTab: 'password',
    user: req.session.user
  });
});

router.post('/profile/change-password', (req, res) => {
  const { current_password, new_password, confirm_password } = req.body;
  const userId = req.session.user.id;

  if (new_password !== confirm_password) {
    return res.send('⚠️ Password baru tidak cocok.');
  }

  const sqlCheck = 'SELECT * FROM users WHERE id = ?';
  db.query(sqlCheck, [userId], (err, results) => {
    if (err || results.length === 0) {
      return res.send('⚠️ Gagal verifikasi user.');
    }

    const user = results[0];

    bcrypt.compare(current_password, user.password, (errCompare, isMatch) => {
      if (errCompare || !isMatch) {
        return res.send('⚠️ Password lama salah.');
      }

      bcrypt.hash(new_password, 10, (errHash, hashedPassword) => {
        if (errHash) return res.send('❌ Gagal mengenkripsi password baru.');

        const sqlUpdate = 'UPDATE users SET password = ? WHERE id = ?';
        db.query(sqlUpdate, [hashedPassword, userId], (err2) => {
          if (err2) return res.send('❌ Gagal mengupdate password.');
          res.redirect('/profile');
        });
      });
    });
  });
});

// =========================
// ROUTE: RESET PASSWORD
// =========================
router.get('/reset-password', (req, res) => {
  res.render('reset-password', { error: null, success: null });
});

router.post('/reset-password', (req, res) => {
  const { email, new_password, confirm_password } = req.body;

  if (new_password !== confirm_password) {
    return res.render('reset-password', { error: 'Password tidak cocok.', success: null });
  }

  const sqlCheck = 'SELECT * FROM users WHERE email = ?';
  db.query(sqlCheck, [email], (err, results) => {
    if (err || results.length === 0) {
      return res.render('reset-password', { error: 'Email tidak ditemukan.', success: null });
    }

    bcrypt.hash(new_password, 10, (errHash, hashedPassword) => {
      if (errHash) return res.render('reset-password', { error: 'Gagal mengenkripsi password.', success: null });

      const sqlUpdate = 'UPDATE users SET password = ? WHERE email = ?';
      db.query(sqlUpdate, [hashedPassword, email], (err2) => {
        if (err2) return res.render('reset-password', { error: 'Gagal mereset password.', success: null });

        res.render('reset-password', { error: null, success: 'Password berhasil direset. Silakan login.' });
      });
    });
  });
});

// =========================
// ROUTE: UPDATE PROFILE
// =========================
router.post('/profile/update', (req, res) => {
  const { id } = req.session.user;
  const { name, gender, birthdate } = req.body;

  const sql = 'UPDATE users SET name = ?, gender = ?, birthdate = ? WHERE id = ?';
  db.query(sql, [name, gender, birthdate, id], (err) => {
    if (err) {
      console.error('❌ Gagal mengupdate profil:', err);
      return res.status(500).send('Gagal mengupdate profil.');
    }

    req.session.user.name = name;
    req.session.user.gender = gender;
    req.session.user.birthdate = birthdate;

    res.redirect('/profile/personal');
  });
});

module.exports = router;

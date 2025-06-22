// routes/index.js
const express = require('express');
const router = express.Router();
const db = require('../db');

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
// ROUTE: CHANGE PASSWORD PAGE
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

  const sqlCheck = 'SELECT * FROM users WHERE id = ? AND password = ?';
  db.query(sqlCheck, [userId, current_password], (err, results) => {
    if (err || results.length === 0) {
      return res.send('⚠️ Password lama salah.');
    }

    if (new_password !== confirm_password) {
      return res.send('⚠️ Password baru tidak cocok.');
    }

    const sqlUpdate = 'UPDATE users SET password = ? WHERE id = ?';
    db.query(sqlUpdate, [new_password, userId], (err2) => {
      if (err2) return res.send('❌ Gagal mengupdate password.');
      res.redirect('/profile');
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

    // Update session agar sinkron
    req.session.user.name = name;
    req.session.user.gender = gender;
    req.session.user.birthdate = birthdate;

    res.redirect('/profile/personal');
  });
});

// =========================
// ROUTE: CHANGE PASSWORD POST
// =========================
router.post('/profile/change-password', (req, res) => {
  const { current_password, new_password, confirm_password } = req.body;
  const userId = req.session.user.id;

  const sqlCheck = 'SELECT * FROM users WHERE id = ? AND password = ?';
  db.query(sqlCheck, [userId, current_password], (err, results) => {
    if (err || results.length === 0) {
      return res.send('⚠️ Password lama salah.');
    }

    if (new_password !== confirm_password) {
      return res.send('⚠️ Password baru tidak cocok.');
    }

    const sqlUpdate = 'UPDATE users SET password = ? WHERE id = ?';
    db.query(sqlUpdate, [new_password, userId], (err2) => {
      if (err2) return res.send('❌ Gagal mengupdate password.');
      res.redirect('/profile');
    });
  });
});

// =========================
// EXPORT ROUTER
// =========================
module.exports = router;

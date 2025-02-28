const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('home', {userId: req.session.userId});
});

router.get('/about', (req, res) => {
    res.render('about', {userId: req.session.userId});
});

router.get('/services', (req, res) => {
    res.render('services', {userId: req.session.userId});
});

router.get('/contact', (req, res) => {
    res.render('contact', {userId: req.session.userId});
});

module.exports = router;
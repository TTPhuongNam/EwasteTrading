const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    if (req.session.isAdmin) {
        next();
    } else {
        res.status(403).send('Access denied. Admins only.');
    }
};

// Admin Dashboard
router.get('/dashboard', isAdmin, async (req, res) => {
    try {
        const users = await User.find();
        const products = await Product.find().populate('seller', 'username');
        res.render('admin/dashboard', { users, products });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error while fetching admin data.');
    }
});

// Edit User
router.get('/users/edit/:id', isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.render('admin/edit-user', { user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error while fetching user.');
    }
});

// Delete User
router.post('/users/delete/:id', isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error while deleting user.');
    }
});

// Edit Product
router.get('/products/edit/:id', isAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('seller', 'username');
        res.render('admin/edit-product', { product });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error while fetching product.');
    }
});

// Delete Product
router.post('/products/delete/:id', isAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error while deleting product.');
    }
});

module.exports = router;
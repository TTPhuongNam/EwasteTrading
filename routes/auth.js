const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET route for registration form
router.get('/register', (req, res) => {
    res.render('register', { userId: req.session.userId });
});

// POST route for user registration
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Input validation
    if (!username || !email || !password) {
        console.log('Validation Failed: ALl fields are required.')
        return res.status(400).send('All fields are required.');
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists', existingUser);
            return res.status(400).send('User already exists. Please try again.');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Password hashed:', hashedPassword);

        // Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        // Save the user to the database
        await newUser.save();
        console.log('New user saved', newUser);

        // Redirect to the login page
        res.redirect('/auth/login');
    } catch (err) {
        console.error('Error during registration', err);
        res.status(500).send('Server error during registration.');
    }
});

// GET route for login form
router.get('/login', (req, res) => {
    res.render('login', { userId: req.session.userId });
});

// POST route for user login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
        return res.status(400).send('Email and password are required.');
    }

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('Invalid email or password. Please try again.');
        }

        // Compare the provided password with the hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send('Invalid email or password. Please try again.');
        }

        // Set the user ID in the session
        req.session.userId = user._id;

        // Redirect to the homepage
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error during login.');
    }
});

// Admin Login Route
router.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !user.isAdmin) {
            return res.status(400).send('Invalid email or password.');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send('Invalid email or password.');
        }

        req.session.userId = user._id;
        req.session.isAdmin = true; // Set admin session

        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error during admin login.');
    }
});

module.exports = router;
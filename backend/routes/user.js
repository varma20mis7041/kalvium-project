const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');


router.post('/register', async (req, res) => {
    const { userId, name } = req.body;

    if (!userId || !name) {
        return res.status(400).json({ message: 'userId and name are required' });
    }

    try {
        const existingUser = await User.findOne({ userId });
        if (existingUser) {
            return res.status(400).json({ message: 'User ID already exists' });
        }

        const newUser = new User({ userId, name });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// User Login
router.post('/login', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User login successful', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/admins', async (req, res) => {
    try {
      const admins = await Admin.find();
      res.json({ message: 'Admins retrieved successfully', admins });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching admins', error: error.message });
    }
  });

module.exports = router;

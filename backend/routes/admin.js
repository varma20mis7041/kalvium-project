const express = require('express');
const multer = require('multer');
const Admin = require('../models/Admin');
const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './files'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname); 
  },
});

const upload = multer({ storage: storage });

router.post('/register', async (req, res) => {
  const { userName, name } = req.body;

  if (!userName || !name) {
    return res.status(400).json({ message: 'userName and name are required' });
  }

  try {
    const existingAdmin = await Admin.findOne({ userName });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const newAdmin = new Admin({ userName, name, pdfs: [] });
    await newAdmin.save();

    res.status(201).json({ message: 'Admin registered successfully', admin: newAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin Login
router.post('/login', async (req, res) => {
  const { userName } = req.body;

  if (!userName) {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    const admin = await Admin.findOne({ userName });
    if (!admin) {
      return res.status(400).json({ message: 'Admin not found' });
    }

    res.status(200).json({ message: 'Admin login successful', admin });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.get('/:userName', async (req, res) => {
  const { userName } = req.params;

  try {
    const admin = await Admin.findOne({ userName });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({ message: 'Admin details fetched successfully', admin });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.post('/upload-files', upload.single('file'), async (req, res) => {
    const { userName, title } = req.body;
    const fileName = req.file.filename;  
  

    if (!userName || !title || !fileName) {
      return res.status(400).json({ message: 'userName, title, and file are required' });
    }
  
    try {
      const admin = await Admin.findOne({ userName });
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
  

      admin.pdfs.push({ title, fileName });
      await admin.save();
  
      res.status(200).json({ status: "ok", message: "File uploaded successfully" });
    } catch (error) {
      console.error("Error uploading file:", error);
      return res.status(500).json({ status: "error", message: error.message });
    }
  });
module.exports = router;

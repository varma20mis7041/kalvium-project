const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    pdfs: [{
        title: { type: String, required: true },
        fileName: { type: String, required: true }
    }]
});

module.exports = mongoose.model('Admin', adminSchema);

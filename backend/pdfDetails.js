const mongoose = require("mongoose");

const PdfDetailsSchema = new mongoose.Schema({
  adminId: { type: String, required: true, unique: true }, // Unique identifier for each admin
  adminName: { type: String, required: true },
  pdfs: [
    {
      title: { type: String, required: true },
      filename: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
});

mongoose.model("PdfDetails", PdfDetailsSchema);

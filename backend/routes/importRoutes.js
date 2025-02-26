const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
// const csvParser = require("csv-parser");
const multer = require("multer");
const Medicine = require("../models/Medicine");

const router = express.Router();

// Multer Storage Setup
const upload = multer({ dest: "uploads/" });

// MongoDB Connection (If not connected in main file)
mongoose.connect(process.env.MONGODB_URI);

// 📌 Import JSON Data
router.post("/json", async (req, res) => {
  try {
    const jsonData = JSON.parse(fs.readFileSync("data/medicines.json", "utf-8"));
    await Medicine.insertMany(jsonData);
    res.status(200).json({ message: "✅ JSON Data Imported Successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "❌ JSON Import Failed" });
  }
});

// 📌 Import CSV Data (Upload CSV File)
// router.post("/csv", upload.single("file"), async (req, res) => {
//   try {
//     const medicines = [];

//     fs.createReadStream(req.file.path)
//       .pipe(csvParser())
//       .on("data", (row) => medicines.push(row))
//       .on("end", async () => {
//         await Medicine.insertMany(medicines);
//         fs.unlinkSync(req.file.path); // Remove uploaded file
//         res.status(200).json({ message: "✅ CSV Data Imported Successfully!" });
//       });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "❌ CSV Import Failed" });
//   }
// });

module.exports = router;

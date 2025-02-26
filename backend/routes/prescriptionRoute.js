const express = require("express");
const { processPrescription } = require("../controllers/prescriptionController");
const upload = require("../middleware/upload");
const router = express.Router();

router.post("/upload", upload.single("file"), processPrescription);

module.exports = router;

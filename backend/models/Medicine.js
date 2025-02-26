const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  name: String,
  category: String,
  dosage_form: String,
  strength: String,
  price_inr: Number,
  manufacturing_company: String,
  indication: String,
  classification: String,
  quantity_in_stock: Number,
});

module.exports = mongoose.model("Medicine", medicineSchema);

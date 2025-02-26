const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  patientDetails: {
    "Patient Name": String,
    "Age": Number,
    "Gender": String,
    "Diagnosis": String,
    "Comments": String,
  },
  clinicalDetails: {
    "Clinic Name": String,
    "Doctor Name": String,
    "Contact": String,
    "Address": String,
    "Qualification": String,
    "Timings": String,
  },
  medicines: [
    {
      name: String,
      quantity: Number,
      price: Number,
    },
  ],
  totalAmount: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema);

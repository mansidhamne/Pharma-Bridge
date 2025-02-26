// const express = require('express');
// const router = express.Router();
// const Medicine = require('../models/Medicine');

// // GET all medicines with optional pagination
// router.get('/', async (req, res) => {
//   try {
//     const { page = 1, limit = 10 } = req.query;
//     const medicines = await Medicine.find()
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .exec();
//     const count = await Medicine.countDocuments();
//     console.log(count);
//     res.json({
//       medicines,
//       totalPages: Math.ceil(count / limit),
//       currentPage: page,
//     });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch medicines' });
//   }
// });

// // GET medicines by category
// router.get('/category/:category', async (req, res) => {
//   try {
//     const { category } = req.params;
//     const medicines = await Medicine.find({ category });
//     res.json(medicines);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch medicines by category' });
//   }
// });

// // GET medicines by name search
// router.get('/search', async (req, res) => {
//   try {
//     const { name } = req.query;
//     const medicines = await Medicine.find({
//       name: { $regex: name, $options: 'i' },
//     });
//     res.json(medicines);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to search medicines by name' });
//   }
// });

// module.exports = router;
// Backend: routes/medicines.js
const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const Order = require('../models/Order');

// GET all medicines with search, category filter and pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', category = '' } = req.query;
    const query = {};

    // Add search condition if search query exists
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Add category filter if category is selected
    if (category) {
      query.category = category;
    }

    const medicines = await Medicine.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const totalItems = await Medicine.countDocuments(query);

    res.json({
      medicines,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: Number(page),
      totalItems
    });
  } catch (err) {
    console.error('Error in GET /medicines:', err);
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
});

router.get('/all', async (req, res) => {
    try {
        const medicines = await Medicine.find();
        res.json(medicines);
    } catch (err) {
        console.error('Error in GET /medicines/all:', err);
        res.status(500).json({ error: 'Failed to fetch medicines' });
    }
});

// GET unique categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Medicine.distinct('category');
    res.json({ categories });
  } catch (err) {
    console.error('Error in GET /medicines/categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.get("/check-availability", async (req, res) => {
    try {
        const { name, quantity } = req.query;
        const medicine = await Medicine.findOne({ name });
        if (!medicine) {
          return res.json({ available: "medicine not found", price: null });
        }

        if (medicine.quantity_in_stock >= quantity) {
            return res.json({ available: "medicine found", price: medicine.price_inr }); // ✅ Always return price
        } else {
            return res.json({ available: "out of stock", price: null });
        }
        // if (medicine && medicine.quantity_in_stock >= quantity) {
        //     res.json({ available: true, price: medicine.price });
        // } 
        } catch (error) {
        res.status(500).json({ error: "Error checking medicine availability" });
    }
});

router.post("/place-order", async (req, res) => {
  const { medicines, patientDetails, clinicalDetails, total } = req.body;

  try {
    const updatedMedicines = [];
    for (const med of medicines) {
      const product = await Medicine.findOne({ name: med.name });
      if (!product) return res.status(404).json({ message: `Medicine ${med.name} not found` });

      if (product.quantity_in_stock < med.quantity)
        return res.status(400).json({ message: `Insufficient stock for ${med.name}` });

      product.quantity_in_stock -= med.quantity;
      await product.save();

      updatedMedicines.push({
        name: product.name,
        quantity: med.quantity,
        price: product.price,
      });
    }
    const order = new Order({
      patientDetails,
      clinicalDetails,
      medicines: updatedMedicines,
      totalAmount: total,
    });

    await order.save();  
    res.json({ message: "Order placed successfully", orderId: order._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
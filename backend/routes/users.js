const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roles');

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user);
});

// PUT /api/users/:id/role -> Admin Only
router.put('/:id/role', auth, checkRole(['ADMIN']), async (req, res) => {
  try {
    const { role } = req.body;
    // Validation
    if (!['ADMIN', 'MANAGER', 'MEMBER'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      { role }, 
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
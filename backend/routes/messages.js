const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const { teamId } = req.query;
  // Security check: Make sure user belongs to the team they are requesting
  if (req.user.teamId.toString() !== teamId) {
      return res.status(403).json({ message: "Access denied" });
  }
  const messages = await Message.find({ teamId }).populate('senderId', 'name').sort({ createdAt: 1 });
  res.json(messages);
});

router.post('/', auth, async (req, res) => {
  try {
    const message = new Message({
      content: req.body.content,
      teamId: req.user.teamId,
      senderId: req.user._id
    });
    await message.save();
    await message.populate('senderId', 'name');

    // Real-time: Broadcast to the specific team room
    req.io.to(req.user.teamId.toString()).emit('receive_message', message);

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
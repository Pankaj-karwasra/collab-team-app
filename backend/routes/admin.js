const router = require('express').Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roles');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

/* Change Role */
router.put('/users/:id/role', auth, checkRole(['ADMIN']), async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true }
  );
  res.json(user);
});

/* Remove User */
router.delete('/users/:id', auth, checkRole(['ADMIN']), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User removed' });
});

/* Activity Logs */
router.get('/activities', auth, checkRole(['ADMIN']), async (req, res) => {
  const logs = await ActivityLog.find({ teamId: req.user.teamId })
    .populate('performedBy', 'name');
  res.json(logs);
});

module.exports = router;

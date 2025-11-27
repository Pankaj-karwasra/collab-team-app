const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/User');
const auth = require('../middleware/auth');

// POST /api/teams -> Create a new team
router.post('/', auth, async (req, res) => {
  const { name, description } = req.body;
  try {
    const team = new Team({
      name,
      description,
      adminId: req.user._id,
      members: [req.user._id]
    });
    await team.save();

    await User.findByIdAndUpdate(req.user._id, {
      teamId: team._id,
      role: 'ADMIN'
    });
    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ⬇️ NEW ROUTE: Add a member to the team (Admin Only) ⬇️
router.post('/add-member', auth, async (req, res) => {
  const { email } = req.body; 
  try {
    // 1. Check if requester is Admin
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: "Only Admins can add members" });
    }

    // 2. Find the user to be added
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
        return res.status(404).json({ message: "User not found with that email" });
    }

    // 3. Add to Team
    await Team.findByIdAndUpdate(req.user.teamId, {
        $addToSet: { members: userToAdd._id } 
    });

    // 4. Update User's teamId
    await User.findByIdAndUpdate(userToAdd._id, {
        teamId: req.user.teamId,
        role: 'MEMBER' 
    });

    res.json({ message: `${userToAdd.name} added to team successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/teams/members -> Get all members
router.get('/members', auth, async (req, res) => {
  try {
    if (!req.user.teamId) {
        return res.status(400).json({ message: "You are not in a team" });
    }
    const team = await Team.findById(req.user.teamId).populate('members', 'name email role');
    res.json(team.members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
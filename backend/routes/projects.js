const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/roles');
const { validate, schemas } = require('../middleware/validate');

// GET /api/projects → Get all projects for team
router.get('/', auth, async (req, res) => {
  try {
    // Assuming the user's teamId is populated in req.user by the auth middleware
    const projects = await Project.find({ teamId: req.user.teamId });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects → Create project (Admin/Manager only)
router.post('/', auth, checkRole(['ADMIN', 'MANAGER']), validate(schemas.project), async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      teamId: req.user.teamId, 
      createdBy: req.user._id
    });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/projects/:id → Update project (Admin/Manager only)
router.put('/:id', auth, checkRole(['ADMIN', 'MANAGER']), async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, teamId: req.user.teamId }, 
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/projects/:id → Delete project (Admin only)
router.delete('/:id', auth, checkRole(['ADMIN']), async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ 
      _id: req.params.id, 
      teamId: req.user.teamId 
    });

    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
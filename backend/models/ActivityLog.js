const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  entityType: { type: String, required: true }, 
  entityId: { type: mongoose.Schema.Types.ObjectId },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);

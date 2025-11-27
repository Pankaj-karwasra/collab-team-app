const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  uid: { type: String, required: true, unique: true }, 
  role: { 
    type: String, 
    enum: ['ADMIN', 'MANAGER', 'MEMBER'], 
    default: 'MEMBER' 
  },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
});

module.exports = mongoose.model('User', UserSchema);
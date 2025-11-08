// models/backendUser/backendUser.model.js
const mongoose = require('mongoose');

const backendUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true // allows multiple users without email
  },
  phone: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: true
  },
  roleAndPermissionModel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoleAndPermission',
    default: null
  },
  block: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BackendUser', backendUserSchema);

const mongoose = require('mongoose');

const roleAndPermissionSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true
  },
  dashboard: {
    type: Number,
    default: 0,
    enum: [0, 1, 2, 3, 4], // 0-none, 1-view, 2-edit, 3-delete, 4-all
    required: true
  },
  bookingManagement: {
    type: Number,
    default: 0,
    enum: [0, 1, 2, 3, 4],
    required: true
  },
  blogManagement: {
    type: Number,
    default: 0,
    enum: [0, 1, 2, 3, 4],
    required: true
  },
  contactUsManagement: {
    type: Number,
    default: 0,
    enum: [0, 1, 2, 3, 4],
    required: true
  },
  suggestionsManagement: {
    type: Number,
    default: 0,
    enum: [0, 1, 2, 3, 4],
    required: true
  },
  backendUserManagement: {
    type: Number,
    default: 0,
    enum: [0, 1, 2, 3, 4],
    required: true
  },
  roleAndPermissionManagement: {
    type: Number,
    default: 0,
    enum: [0, 1, 2, 3, 4],
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RoleAndPermission', roleAndPermissionSchema);

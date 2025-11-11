const BackendUser = require('../../models/backendUser/backendUser.model');
const RoleAndPermission = require('../../models/backendUser/roleAndPermission.model');
const bcrypt = require('bcryptjs');

/**
 * ✅ Create a new backend user
 */
const createBackendUser = async (req, res) => {
  try {
    const { name, email, phone, password, roleId } = req.body;

    // 🔍 Validation
    if (!name?.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Name and password are required' });
    }

    if (!email && !phone) {
      return res.status(400).json({ success: false, message: 'Either email or phone is required' });
    }

    // 🔍 Check for duplicates
    const existingUser = await BackendUser.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.email === email
          ? 'Email already exists'
          : 'Phone already exists'
      });
    }

    // 🔍 Validate role
    let assignedRole = null;
    if (roleId) {
      assignedRole = await RoleAndPermission.findById(roleId);
      if (!assignedRole) {
        return res.status(404).json({ success: false, message: 'Invalid role ID' });
      }
    }

    // 🔒 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🧩 Create new user
    const newUser = new BackendUser({
      name: name.trim(),
      email: email ? email.trim() : undefined,
      phone: phone ? phone.trim() : undefined,
      password: hashedPassword,
      roleAndPermissionModel: assignedRole ? assignedRole._id : null
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Backend user created successfully',
      user: savedUser
    });
  } catch (error) {
    console.error('Error creating backend user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating backend user',
      error: error.message
    });
  }
};

/**
 * ✅ Get all backend users
 */
const getAllBackendUsers = async (req, res) => {
  try {
    const { name, email, phone, role, block } = req.body;

    // ✅ Build dynamic filter object
    const filter = {};

    // 🔍 Regex-based matching (case-insensitive)
    if (name) filter.name = { $regex: name, $options: "i" };
    if (email) filter.email = { $regex: email, $options: "i" };
    if (phone) filter.phone = { $regex: phone, $options: "i" };

    // 🧩 Match by block status if provided
    if (block !== undefined) {
      filter.block = block === "true" || block === true;
    }

    // 🧩 Role-based filtering (joins through populate)
    let roleFilter = {};
    if (role) {
      roleFilter = { role: { $regex: role, $options: "i" } };
    }

    // ✅ Fetch users with filters
    const users = await BackendUser.find(filter)
      .populate({
        path: "roleAndPermissionModel",
        match: roleFilter, // role filter applies here
        select:
          "role dashboard bookingManagement blogManagement contactUsManagement",
      })
      .select("-password")
      .sort({ createdAt: -1 });

    // 🧹 Remove users with null role after populate + filter
    const filteredUsers = users.filter((user) => {
      if (role) {
        return user.roleAndPermissionModel !== null;
      }
      return true;
    });

    res.status(200).json({
      success: true,
      message: "Backend users fetched successfully",
      total: filteredUsers.length,
      users: filteredUsers,
    });
  } catch (error) {
    console.error("Error fetching backend users:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching backend users",
      error: error.message,
    });
  }
};


/**
 * ✅ Get backend user by ID
 */
const getBackendUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await BackendUser.findById(id)
      .populate('roleAndPermissionModel', 'role dashboard bookingManagement blogManagement contactUsManagement')
      .select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Backend user not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Backend user fetched successfully',
      user
    });
  } catch (error) {
    console.error('Error fetching backend user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching backend user',
      error: error.message
    });
  }
};

/**
 * ✅ Update backend user by ID
 */
const updateBackendUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, password, roleId, block } = req.body;

    const existingUser = await BackendUser.findById(id);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'Backend user not found' });
    }

    // 🔍 Duplicate email/phone check
    if (email && email !== existingUser.email) {
      const emailExists = await BackendUser.findOne({ email });
      if (emailExists) {
        return res.status(409).json({ success: false, message: 'Email already exists' });
      }
    }

    if (phone && phone !== existingUser.phone) {
      const phoneExists = await BackendUser.findOne({ phone });
      if (phoneExists) {
        return res.status(409).json({ success: false, message: 'Phone already exists' });
      }
    }

    // 🔍 Validate new role
    if (roleId) {
      const foundRole = await RoleAndPermission.findById(roleId);
      if (!foundRole) {
        return res.status(404).json({ success: false, message: 'Invalid role ID' });
      }
      existingUser.roleAndPermissionModel = foundRole._id;
    }

    // 🔒 Hash password if updated
    if (password) {
      existingUser.password = await bcrypt.hash(password, 10);
    }

    // 🧩 Update other fields
    if (name) existingUser.name = name.trim();
    if (email) existingUser.email = email.trim();
    if (phone) existingUser.phone = phone.trim();
    if (typeof block === 'boolean') existingUser.block = block;

    const updatedUser = await existingUser.save();

    res.status(200).json({
      success: true,
      message: 'Backend user updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating backend user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating backend user',
      error: error.message
    });
  }
};

/**
 * ✅ Delete backend user by ID
 */
const deleteBackendUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await BackendUser.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Backend user not found' });
    }

    await BackendUser.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Backend user deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting backend user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting backend user',
      error: error.message
    });
  }
};

module.exports = {
  createBackendUser,
  getAllBackendUsers,
  getBackendUserById,
  updateBackendUserById,
  deleteBackendUserById
};

const RoleAndPermission = require('../../models/backendUser/roleAndPermission.model');
const BackendUser = require('../../models/backendUser/backendUser.model');

const createRoleAndPermission = async (req, res) => {
    try {
      const { role, dashboard, bookingManagement, blogManagement, contactUsManagement } = req.body;
  
      if (!role || !role.trim()) {
        return res.status(400).json({ success: false, message: 'Role name is required' });
      }
  
      // ✅ Find existing role
      const isRoleExist = await RoleAndPermission.findOne({ role: role.trim() });
      if (isRoleExist) {
        return res.status(409).json({ success: false, message: 'Role already exists' });
      }
  
      const validPermissions = [0, 1, 2, 3, 4];
      const validatePermission = (value, fieldName) => {
        if (value !== undefined && !validPermissions.includes(Number(value))) {
          throw new Error(`${fieldName} must be one of: 0 (none), 1 (view), 2 (edit), 3 (delete), 4 (all)`);
        }
        return value !== undefined ? Number(value) : 0;
      };
  
      // ✅ Validate and set values
      const dashboardValue = validatePermission(dashboard, 'dashboard');
      const bookingManagementValue = validatePermission(bookingManagement, 'bookingManagement');
      const blogManagementValue = validatePermission(blogManagement, 'blogManagement');
      const contactUsManagementValue = validatePermission(contactUsManagement, 'contactUsManagement');
  
      // ✅ Create new role
      const newRolePermission = new RoleAndPermission({
        role: role.trim(),
        dashboard: dashboardValue,
        bookingManagement: bookingManagementValue,
        blogManagement: blogManagementValue,
        contactUsManagement: contactUsManagementValue
      });
  
      const savedRole = await newRolePermission.save();
  
      res.status(201).json({
        success: true,
        message: 'New role created successfully',
        role: savedRole
      });
  
    } catch (error) {
      console.error('Error creating role:', error);
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }
  
      res.status(500).json({
        success: false,
        message: 'Server error while creating role',
        error: error.message
      });
    }
  };


const getAllRolePermissions = async (req, res) => {
    try {
        const roles = await RoleAndPermission.find();

        res.status(200).json({
            success: true,
            message: 'Roles fetched successfully',
            roles
        });
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching roles' });
    }
};


const getRolePermissionById = async (req, res) => {
    try {
        const { id } = req.params;

        const role = await RoleAndPermission.findById(id);
        if (!role) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Role fetched successfully',
            role
        });
    } catch (error) {
        console.error('Error fetching role by ID:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching role by ID' });
    }
};


const updateRolePermissionById = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, dashboard, bookingManagement, blogManagement, contactUsManagement } = req.body;

        const existingRole = await RoleAndPermission.findById(id);
        if (!existingRole) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }

        // Optional: Prevent updating to an already-existing role name
        if (role && role.trim() !== existingRole.role) {
            const duplicateRole = await RoleAndPermission.findOne({ role: role.trim() });
            if (duplicateRole) {
                return res.status(409).json({ success: false, message: 'Role name already in use' });
            }
        }

        // Validate permission values if provided
        const validPermissions = [0, 1, 2, 3, 4];
        const validatePermission = (value, fieldName, existingValue) => {
            if (value !== undefined) {
                const numValue = Number(value);
                if (!validPermissions.includes(numValue)) {
                    throw new Error(`${fieldName} must be one of: 0 (none), 1 (view), 2 (edit), 3 (delete), 4 (all)`);
                }
                return numValue;
            }
            return existingValue;
        };

        try {
            const updateData = {
                role: role?.trim() || existingRole.role,
                dashboard: validatePermission(dashboard, 'dashboard', existingRole.dashboard),
                bookingManagement: validatePermission(bookingManagement, 'bookingManagement', existingRole.bookingManagement),
                blogManagement: validatePermission(blogManagement, 'blogManagement', existingRole.blogManagement),
                contactUsManagement: validatePermission(contactUsManagement, 'contactUsManagement', existingRole.contactUsManagement)
            };

            const updatedRole = await RoleAndPermission.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true } 
            );

            res.status(200).json({
                success: true,
                message: 'Role updated successfully',
                role: updatedRole
            });
        } catch (validationError) {
            return res.status(400).json({ 
                success: false, 
                message: validationError.message 
            });
        }
    } catch (error) {
        console.error('Error updating role:', error);
        
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                success: false, 
                message: 'Validation failed', 
                errors: errors 
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid ID format' 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: 'Server error while updating role',
            error: error.message 
        });
    }
};


const deleteRolePermissionById = async (req, res) => {
    try {
        const { id } = req.params;

        const role = await RoleAndPermission.findById(id);
        if (!role) {
            return res.status(404).json({ success: false, message: 'Role not found' });
        }

        await RoleAndPermission.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Role deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting role:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting role' });
    }
};

module.exports = {
    createRoleAndPermission,
    getAllRolePermissions,
    getRolePermissionById,
    updateRolePermissionById,
    deleteRolePermissionById
};

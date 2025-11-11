const express = require('express');
const router = express.Router();
const {
    createRoleAndPermission,
    getAllRolePermissions,
    getRolePermissionById,
    updateRolePermissionById,
    deleteRolePermissionById
} = require('../../controllers/BackendUserManagement/RolePermission.controller');

router.post('/', createRoleAndPermission);
router.post('/all', getAllRolePermissions);
router.get('/:id', getRolePermissionById);
router.patch('/:id', updateRolePermissionById);
router.delete('/:id', deleteRolePermissionById);

module.exports = router;


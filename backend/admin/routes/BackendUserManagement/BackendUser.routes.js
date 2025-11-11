const express = require('express');
const router = express.Router();
const {
    createBackendUser,
    getAllBackendUsers,
    getBackendUserById,
    updateBackendUserById,
    deleteBackendUserById
} = require('../../controllers/BackendUserManagement/BackendUser.controller');


router.post('/', createBackendUser);

router.post('/all', getAllBackendUsers);

router.get('/:id', getBackendUserById);

router.patch('/:id', updateBackendUserById);

router.delete('/:id', deleteBackendUserById);

module.exports = router;


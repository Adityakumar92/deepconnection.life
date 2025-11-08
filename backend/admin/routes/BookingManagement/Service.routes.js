const express = require('express');
const router = express.Router();
const {
    createService,
    getAllServices,
    getServiceById,
    updateServiceById,
    deleteServiceById
} = require('../../controllers/BookingManagement/Service.controller');

router.post('/', createService);
router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.patch('/:id', updateServiceById);
router.delete('/:id', deleteServiceById);

module.exports = router;


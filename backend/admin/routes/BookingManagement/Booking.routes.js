const express = require('express');
const router = express.Router();
const {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBookingById,
    deleteBookingById
} = require('../../controllers/BookingManagement/Booking.controller');


router.post('/', createBooking);
router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.patch('/:id', updateBookingById);
router.delete('/:id', deleteBookingById);

module.exports = router;


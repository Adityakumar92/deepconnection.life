const Booking = require('../../models/booking/booking.model');
const Service = require('../../models/booking/service.model');
const Program = require('../../models/booking/program.model');

const createBooking = async (req, res) => {
    try {
        const { name, email, phone, serviceType, programType, message, status } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !serviceType || !programType || !message || !status) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        // ✅ Validate if serviceType and programType exist
        const serviceExists = await Service.findById(serviceType);
        if (!serviceExists) {
            return res.status(404).json({
                success: false,
                message: 'Invalid serviceType — Service not found',
            });
        }

        const programExists = await Program.findById(programType);
        if (!programExists) {
            return res.status(404).json({
                success: false,
                message: 'Invalid programType — Program not found',
            });
        }

        // ✅ Prevent duplicate booking by email or phone
        const existingBooking = await Booking.findOne({
            $or: [{ email }, { phone }],
        });
        if (existingBooking) {
            return res.status(409).json({
                success: false,
                message: 'Booking with this email or phone already exists',
            });
        }

        // ✅ Create new booking
        const newBooking = new Booking({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            serviceType,
            programType,
            message: message.trim(),
            status: status.trim(),
        });

        const savedBooking = await newBooking.save();

        // Populate related data before sending response
        const populatedBooking = await savedBooking
            .populate('serviceType', 'name status')
            .populate('programType', 'name status');

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: populatedBooking,
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating booking',
        });
    }
};


const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('serviceType', 'name status')
            .populate('programType', 'name status')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Bookings fetched successfully',
            bookings,
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching bookings',
        });
    }
};

const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id)
            .populate('serviceType', 'name status')
            .populate('programType', 'name status');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Booking fetched successfully',
            booking,
        });
    } catch (error) {
        console.error('Error fetching booking by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching booking by ID',
        });
    }
};


const updateBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, serviceType, programType, message, status } = req.body;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // ✅ Validate new serviceType and programType if changed
        if (serviceType) {
            const serviceExists = await Service.findById(serviceType);
            if (!serviceExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Invalid serviceType — Service not found',
                });
            }
            booking.serviceType = serviceType;
        }

        if (programType) {
            const programExists = await Program.findById(programType);
            if (!programExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Invalid programType — Program not found',
                });
            }
            booking.programType = programType;
        }

        // ✅ Validate duplicate email/phone if changed
        if (email && email !== booking.email) {
            const emailExists = await Booking.findOne({ email });
            if (emailExists) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already in use by another booking',
                });
            }
        }

        if (phone && phone !== booking.phone) {
            const phoneExists = await Booking.findOne({ phone });
            if (phoneExists) {
                return res.status(409).json({
                    success: false,
                    message: 'Phone already in use by another booking',
                });
            }
        }

        // ✅ Update fields
        booking.name = name?.trim() || booking.name;
        booking.email = email?.trim() || booking.email;
        booking.phone = phone?.trim() || booking.phone;
        booking.message = message?.trim() || booking.message;
        booking.status = status?.trim() || booking.status;

        const updatedBooking = await booking.save();

        const populatedBooking = await updatedBooking
            .populate('serviceType', 'name status')
            .populate('programType', 'name status');

        res.status(200).json({
            success: true,
            message: 'Booking updated successfully',
            booking: populatedBooking,
        });
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating booking',
        });
    }
};


const deleteBookingById = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        await Booking.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Booking deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting booking',
        });
    }
};

module.exports = {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBookingById,
    deleteBookingById,
};

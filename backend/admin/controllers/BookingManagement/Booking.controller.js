const Booking = require('../../models/booking/booking.model');
const Service = require('../../models/booking/service.model');
const Program = require('../../models/booking/program.model');

const createBooking = async (req, res) => {
  try {
    const { name, email, phone, serviceType, programType, message, status } = req.body;

    // ✅ Validate required fields
    if (!name || !email || !phone || !serviceType || !programType || !message || !status) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ✅ Validate related models
    const serviceExists = await Service.findById(serviceType);
    if (!serviceExists) {
      return res.status(404).json({ success: false, message: "Invalid serviceType — Service not found" });
    }

    const programExists = await Program.findById(programType);
    if (!programExists) {
      return res.status(404).json({ success: false, message: "Invalid programType — Program not found" });
    }

    // ✅ Prevent duplicate booking by email or phone
    const existingBooking = await Booking.findOne({ $or: [{ email }, { phone }] });
    if (existingBooking) {
      return res.status(409).json({ success: false, message: "Booking with this email or phone already exists" });
    }

    // ✅ Create and save
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

    // ✅ Properly populate using Booking.findById
    const populatedBooking = await Booking.findById(savedBooking._id)
      .populate("serviceType", "name status")
      .populate("programType", "name status");

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating booking",
      error: error.message, // include for debugging
    });
  }
};


/**
 * ✅ Get all Bookings with filters and search
 */
const getAllBookings = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      status,
      serviceType,
      programType,
      search,
    } = req.body;

    const filters = {};

    // 🟢 Basic field filters using regex for partial matches
    if (name) filters.name = { $regex: name.trim(), $options: "i" };
    if (email) filters.email = { $regex: email.trim(), $options: "i" };
    if (phone) filters.phone = { $regex: phone.trim(), $options: "i" };
    if (status) filters.status = { $regex: status.trim(), $options: "i" };

    // 🟢 Filter by referenced Service and Program IDs (if provided)
    if (serviceType) filters.serviceType = serviceType;
    if (programType) filters.programType = programType;

    // 🟢 Global search across name, email, phone, message, and status
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
      ];
    }

    // 🟢 Fetch bookings and populate relations
    const bookings = await Booking.find(filters)
      .populate("serviceType", "name status")
      .populate("programType", "name status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      total: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching bookings",
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

    // ✅ Find existing booking
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ✅ Validate serviceType if changed
    if (serviceType && serviceType !== booking.serviceType?.toString()) {
      const serviceExists = await Service.findById(serviceType);
      if (!serviceExists) {
        return res.status(404).json({
          success: false,
          message: "Invalid serviceType — Service not found",
        });
      }
      booking.serviceType = serviceType;
    }

    // ✅ Validate programType if changed
    if (programType && programType !== booking.programType?.toString()) {
      const programExists = await Program.findById(programType);
      if (!programExists) {
        return res.status(404).json({
          success: false,
          message: "Invalid programType — Program not found",
        });
      }
      booking.programType = programType;
    }

    // ✅ Prevent duplicate email or phone if changed
    if (email && email !== booking.email) {
      const emailExists = await Booking.findOne({ email });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email already in use by another booking",
        });
      }
      booking.email = email.trim();
    }

    if (phone && phone !== booking.phone) {
      const phoneExists = await Booking.findOne({ phone });
      if (phoneExists) {
        return res.status(409).json({
          success: false,
          message: "Phone already in use by another booking",
        });
      }
      booking.phone = phone.trim();
    }

    // ✅ Update remaining fields
    booking.name = name?.trim() || booking.name;
    booking.message = message?.trim() || booking.message;
    booking.status = status?.trim() || booking.status;

    // ✅ Save changes
    await booking.save();

    // ✅ Fetch updated and populated document
    const populatedBooking = await Booking.findById(booking._id)
      .populate("serviceType", "name status")
      .populate("programType", "name status");

    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("❌ Error updating booking:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating booking",
      error: error.message,
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

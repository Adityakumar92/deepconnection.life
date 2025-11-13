const Service = require('../../models/booking/service.model');

/**
 * ✅ Create a new Service
 */
const createService = async (req, res) => {
    try {
        const { name, status } = req.body;

        // Validate input
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Service name is required' });
        }

        // Check for duplicate service name
        const existingService = await Service.findOne({ name: name.trim() });
        if (existingService) {
            return res.status(409).json({ success: false, message: 'Service with this name already exists' });
        }

        // Create and save new service
        const newService = new Service({
            name: name.trim(),
            status: status ?? true, // default to true if not provided
        });

        const savedService = await newService.save();

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            service: savedService,
        });
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ success: false, message: 'Server error while creating service' });
    }
};

/**
 * ✅ Get all Services (with filtering & search)
 */
const getAllServices = async (req, res) => {
  try {
    const { status, name, search } = req.body;

    const filters = {};

    // 🟢 Filter by active/inactive status
    if (status !== undefined && status !== "") {
      filters.status = status === "true" || status === true;
    }

    // 🟢 Partial match for name
    if (name) {
      filters.name = { $regex: name.trim(), $options: "i" };
    }

    // 🟢 Global search — matches across fields
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
      ];
    }

    // 🟢 Fetch and sort by newest first
    const services = await Service.find(filters).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Services fetched successfully",
      total: services.length,
      services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching services",
    });
  }
};


/**
 * ✅ Get a single Service by ID
 */
const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await Service.findById(id);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Service fetched successfully',
            service,
        });
    } catch (error) {
        console.error('Error fetching service by ID:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching service' });
    }
};

/**
 * ✅ Update Service by ID
 */
const updateServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, status } = req.body;

        const existingService = await Service.findById(id);
        if (!existingService) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        // Check duplicate name (if changed)
        if (name && name.trim() !== existingService.name) {
            const duplicate = await Service.findOne({ name: name.trim() });
            if (duplicate) {
                return res.status(409).json({ success: false, message: 'Service name already exists' });
            }
        }

        // Update fields
        existingService.name = name?.trim() || existingService.name;
        existingService.status = typeof status === 'boolean' ? status : existingService.status;

        const updatedService = await existingService.save();

        res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            service: updatedService,
        });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ success: false, message: 'Server error while updating service' });
    }
};

/**
 * ✅ Delete Service by ID
 */
const deleteServiceById = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await Service.findById(id);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        await Service.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Service deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting service' });
    }
};

module.exports = {
    createService,
    getAllServices,
    getServiceById,
    updateServiceById,
    deleteServiceById,
};

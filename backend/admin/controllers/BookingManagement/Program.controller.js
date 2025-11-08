const Program = require('../../models/booking/program.model'); // adjust path if needed

/**
 * ✅ Create a new Program
 */
const createProgram = async (req, res) => {
    try {
        const { name, status } = req.body;

        // Validation
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Program name is required' });
        }

        // Check if program already exists
        const existingProgram = await Program.findOne({ name: name.trim() });
        if (existingProgram) {
            return res.status(409).json({ success: false, message: 'Program with this name already exists' });
        }

        const newProgram = new Program({
            name: name.trim(),
            status: status ?? true // default true if not provided
        });

        const savedProgram = await newProgram.save();

        res.status(201).json({
            success: true,
            message: 'Program created successfully',
            program: savedProgram
        });
    } catch (error) {
        console.error('Error creating program:', error);
        res.status(500).json({ success: false, message: 'Server error while creating program' });
    }
};

/**
 * ✅ Get all Programs
 */
const getAllPrograms = async (req, res) => {
    try {
        const programs = await Program.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Programs fetched successfully',
            programs
        });
    } catch (error) {
        console.error('Error fetching programs:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching programs' });
    }
};

/**
 * ✅ Get Program by ID
 */
const getProgramById = async (req, res) => {
    try {
        const { id } = req.params;

        const program = await Program.findById(id);
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Program fetched successfully',
            program
        });
    } catch (error) {
        console.error('Error fetching program by ID:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching program' });
    }
};

/**
 * ✅ Update Program by ID
 */
const updateProgramById = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, status } = req.body;

        const existingProgram = await Program.findById(id);
        if (!existingProgram) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }

        // Check for duplicate name if updated
        if (name && name.trim() !== existingProgram.name) {
            const duplicate = await Program.findOne({ name: name.trim() });
            if (duplicate) {
                return res.status(409).json({ success: false, message: 'Program name already exists' });
            }
        }

        existingProgram.name = name?.trim() || existingProgram.name;
        existingProgram.status = typeof status === 'boolean' ? status : existingProgram.status;

        const updatedProgram = await existingProgram.save();

        res.status(200).json({
            success: true,
            message: 'Program updated successfully',
            program: updatedProgram
        });
    } catch (error) {
        console.error('Error updating program:', error);
        res.status(500).json({ success: false, message: 'Server error while updating program' });
    }
};

/**
 * ✅ Delete Program by ID
 */
const deleteProgramById = async (req, res) => {
    try {
        const { id } = req.params;

        const program = await Program.findById(id);
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }

        await Program.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Program deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting program:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting program' });
    }
};

module.exports = {
    createProgram,
    getAllPrograms,
    getProgramById,
    updateProgramById,
    deleteProgramById
};

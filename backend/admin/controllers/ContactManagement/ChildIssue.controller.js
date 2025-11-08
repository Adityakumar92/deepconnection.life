const ChildIssue = require('../../models/contact/childIssue.model');

/**
 * ✅ Create a new Child Issue
 */
const createChildIssue = async (req, res) => {
    try {
        const { name, status } = req.body;

        // Validate input
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        // Check for duplicate name
        const existingIssue = await ChildIssue.findOne({ name: name.trim() });
        if (existingIssue) {
            return res.status(409).json({ success: false, message: 'Child issue with this name already exists' });
        }

        // Create new record
        const newIssue = new ChildIssue({
            name: name.trim(),
            status: typeof status === 'boolean' ? status : true
        });

        const savedIssue = await newIssue.save();

        res.status(201).json({
            success: true,
            message: 'Child issue created successfully',
            childIssue: savedIssue
        });
    } catch (error) {
        console.error('Error creating child issue:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating child issue'
        });
    }
};

/**
 * ✅ Get all Child Issues
 */
const getAllChildIssues = async (req, res) => {
    try {
        const childIssues = await ChildIssue.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Child issues fetched successfully',
            childIssues
        });
    } catch (error) {
        console.error('Error fetching child issues:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching child issues'
        });
    }
};

/**
 * ✅ Get Child Issue by ID
 */
const getChildIssueById = async (req, res) => {
    try {
        const { id } = req.params;

        const childIssue = await ChildIssue.findById(id);
        if (!childIssue) {
            return res.status(404).json({ success: false, message: 'Child issue not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Child issue fetched successfully',
            childIssue
        });
    } catch (error) {
        console.error('Error fetching child issue by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching child issue by ID'
        });
    }
};

/**
 * ✅ Update Child Issue by ID
 */
const updateChildIssueById = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, status } = req.body;

        const existingIssue = await ChildIssue.findById(id);
        if (!existingIssue) {
            return res.status(404).json({ success: false, message: 'Child issue not found' });
        }

        // Check for duplicate name if updated
        if (name && name.trim() !== existingIssue.name) {
            const duplicate = await ChildIssue.findOne({ name: name.trim() });
            if (duplicate) {
                return res.status(409).json({ success: false, message: 'Child issue name already exists' });
            }
        }

        existingIssue.name = name?.trim() || existingIssue.name;
        existingIssue.status = typeof status === 'boolean' ? status : existingIssue.status;

        const updatedIssue = await existingIssue.save();

        res.status(200).json({
            success: true,
            message: 'Child issue updated successfully',
            childIssue: updatedIssue
        });
    } catch (error) {
        console.error('Error updating child issue:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating child issue'
        });
    }
};

/**
 * ✅ Delete Child Issue by ID
 */
const deleteChildIssueById = async (req, res) => {
    try {
        const { id } = req.params;

        const childIssue = await ChildIssue.findById(id);
        if (!childIssue) {
            return res.status(404).json({ success: false, message: 'Child issue not found' });
        }

        await ChildIssue.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Child issue deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting child issue:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting child issue'
        });
    }
};

module.exports = {
    createChildIssue,
    getAllChildIssues,
    getChildIssueById,
    updateChildIssueById,
    deleteChildIssueById
};

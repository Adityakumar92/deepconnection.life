const Suggestion = require('../../models/suggestion/suggestion.model');

/**
 * ✅ Create a new Suggestion
 */
const createSuggestion = async (req, res) => {
    try {
        const { name, email, topic } = req.body;

        // Validate inputs
        if (!name || !email || !topic) {
            return res.status(400).json({
                success: false,
                message: 'All fields (name, email, topic) are required'
            });
        }

        // Check if email already exists
        const existingSuggestion = await Suggestion.findOne({ email });
        if (existingSuggestion) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists for another suggestion'
            });
        }

        // Create and save new suggestion
        const newSuggestion = new Suggestion({
            name: name.trim(),
            email: email.trim(),
            topic: topic.trim()
        });

        const savedSuggestion = await newSuggestion.save();

        res.status(201).json({
            success: true,
            message: 'Suggestion created successfully',
            suggestion: savedSuggestion
        });

    } catch (error) {
        console.error('Error creating suggestion:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating suggestion'
        });
    }
};

/**
 * ✅ Get all Suggestions
 */
const getAllSuggestions = async (req, res) => {
    try {
        const suggestions = await Suggestion.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Suggestions fetched successfully',
            suggestions
        });
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching suggestions'
        });
    }
};

/**
 * ✅ Get Suggestion by ID
 */
const getSuggestionById = async (req, res) => {
    try {
        const { id } = req.params;

        const suggestion = await Suggestion.findById(id);
        if (!suggestion) {
            return res.status(404).json({
                success: false,
                message: 'Suggestion not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Suggestion fetched successfully',
            suggestion
        });

    } catch (error) {
        console.error('Error fetching suggestion by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching suggestion by ID'
        });
    }
};

/**
 * ✅ Update Suggestion by ID
 */
const updateSuggestionById = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, topic } = req.body;

        const suggestion = await Suggestion.findById(id);
        if (!suggestion) {
            return res.status(404).json({
                success: false,
                message: 'Suggestion not found'
            });
        }

        // Check for duplicate email if changed
        if (email && email !== suggestion.email) {
            const emailExists = await Suggestion.findOne({ email });
            if (emailExists) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already in use by another suggestion'
                });
            }
        }

        suggestion.name = name?.trim() || suggestion.name;
        suggestion.email = email?.trim() || suggestion.email;
        suggestion.topic = topic?.trim() || suggestion.topic;

        const updatedSuggestion = await suggestion.save();

        res.status(200).json({
            success: true,
            message: 'Suggestion updated successfully',
            suggestion: updatedSuggestion
        });

    } catch (error) {
        console.error('Error updating suggestion:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating suggestion'
        });
    }
};

/**
 * ✅ Delete Suggestion by ID
 */
const deleteSuggestionById = async (req, res) => {
    try {
        const { id } = req.params;

        const suggestion = await Suggestion.findById(id);
        if (!suggestion) {
            return res.status(404).json({
                success: false,
                message: 'Suggestion not found'
            });
        }

        await Suggestion.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Suggestion deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting suggestion:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting suggestion'
        });
    }
};

module.exports = {
    createSuggestion,
    getAllSuggestions,
    getSuggestionById,
    updateSuggestionById,
    deleteSuggestionById
};

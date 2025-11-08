const Contact = require('../../models/contact/contact.model');
const ChildIssue = require('../../models/contact/childIssue.model');

/**
 * ✅ Create a new Contact
 */
const createContact = async (req, res) => {
    try {
        const { name, phone, email, childIssue, message, website } = req.body;

        // Validate required fields
        if (!name || !phone || !email || !childIssue || !message) {
            return res.status(400).json({
                success: false,
                message: 'All required fields (name, phone, email, childIssue, message) must be provided',
            });
        }

        // ✅ Check if referenced childIssue exists
        const issueExists = await ChildIssue.findById(childIssue);
        if (!issueExists) {
            return res.status(404).json({
                success: false,
                message: 'Invalid childIssue — no matching record found',
            });
        }

        // ✅ Optional duplicate check (same email & phone)
        const existingContact = await Contact.findOne({ email, phone });
        if (existingContact) {
            return res.status(409).json({
                success: false,
                message: 'A contact with this email and phone already exists',
            });
        }

        // ✅ Create and save new contact
        const newContact = new Contact({
            name: name.trim(),
            phone,
            email: email.trim(),
            childIssue,
            message: message.trim(),
            website: website ?? 0, // default to 0 if not provided
        });

        const savedContact = await newContact.save();

        // ✅ Populate childIssue details
        const populatedContact = await savedContact.populate('childIssue', 'name status');

        res.status(201).json({
            success: true,
            message: 'Contact created successfully',
            contact: populatedContact,
        });
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating contact',
        });
    }
};

/**
 * ✅ Get all Contacts
 */
const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find()
            .populate('childIssue', 'name status')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Contacts fetched successfully',
            contacts,
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching contacts',
        });
    }
};

/**
 * ✅ Get Contact by ID
 */
const getContactById = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findById(id).populate('childIssue', 'name status');

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Contact fetched successfully',
            contact,
        });
    } catch (error) {
        console.error('Error fetching contact by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching contact by ID',
        });
    }
};

/**
 * ✅ Update Contact by ID
 */
const updateContactById = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, email, childIssue, message, website } = req.body;

        const contact = await Contact.findById(id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found',
            });
        }

        // ✅ Check if new childIssue is valid (if updated)
        if (childIssue) {
            const issueExists = await ChildIssue.findById(childIssue);
            if (!issueExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Invalid childIssue — no matching record found',
                });
            }
            contact.childIssue = childIssue;
        }

        // ✅ Update fields
        contact.name = name?.trim() || contact.name;
        contact.phone = phone || contact.phone;
        contact.email = email?.trim() || contact.email;
        contact.message = message?.trim() || contact.message;
        contact.website = typeof website === 'number' ? website : contact.website;

        const updatedContact = await contact.save();
        const populatedContact = await updatedContact.populate('childIssue', 'name status');

        res.status(200).json({
            success: true,
            message: 'Contact updated successfully',
            contact: populatedContact,
        });
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating contact',
        });
    }
};

/**
 * ✅ Delete Contact by ID
 */
const deleteContactById = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findById(id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found',
            });
        }

        await Contact.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Contact deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting contact',
        });
    }
};

module.exports = {
    createContact,
    getAllContacts,
    getContactById,
    updateContactById,
    deleteContactById,
};

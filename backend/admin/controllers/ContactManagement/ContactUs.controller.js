const Contact = require('../../models/contact/contact.model');
const ChildIssue = require('../../models/contact/childIssue.model');

/** ================================
 * CREATE CONTACT
 ==================================*/
const createContact = async (req, res) => {
  try {
    const { name, phone, email, childIssue, message, website } = req.body;

    // Required fields validation
    if (!name || !phone || !email || !childIssue || !message) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Validate childIssue
    const issueExists = await ChildIssue.findById(childIssue);
    if (!issueExists) {
      return res.status(404).json({
        success: false,
        message: "Invalid childIssue — not found",
      });
    }

    // Duplicate check (email or phone)
    const existing = await Contact.findOne({
      $or: [{ email }, { phone }],
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Contact with this email or phone already exists",
      });
    }

    // Create
    const newContact = new Contact({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      childIssue,
      message: message.trim(),
      website: website ?? 0,
    });

    const saved = await newContact.save();
    const populated = await Contact.findById(saved._id).populate("childIssue");

    return res.status(201).json({
      success: true,
      message: "Contact created successfully",
      contact: populated,
    });
  } catch (error) {
    console.error("Error creating contact:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating contact",
      error: error.message,
    });
  }
};


/** ================================
 * GET ALL CONTACTS (With Filters)
 ==================================*/
const getAllContacts = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      website,
      childIssue,
      search,
    } = req.body;

    const filters = {};

    // 🟢 Regex filters (partial match)
    if (name) filters.name = { $regex: name.trim(), $options: "i" };
    if (email) filters.email = { $regex: email.trim(), $options: "i" };
    if (phone) filters.phone = { $regex: phone.trim(), $options: "i" };

    // 🟢 Website filter (0 or 1)
    if (website !== "" && website !== undefined) {
      filters.website = Number(website);
    }

    // 🟢 Child Issue exact match (ObjectId)
    if (childIssue) {
      filters.childIssue = childIssue;
    }

    // 🟢 Global Search
    if (search) {
      filters.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
        { phone: { $regex: search.trim(), $options: "i" } },
        { message: { $regex: search.trim(), $options: "i" } },
      ];
    }

    // 🟢 Fetch + populate
    const contacts = await Contact.find(filters)
      .populate("childIssue", "name status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Contacts fetched successfully",
      total: contacts.length,
      contacts,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching contacts",
    });
  }
};



/** ================================
 * GET CONTACT BY ID
 ==================================*/
const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id).populate("childIssue");

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact fetched successfully",
      contact,
    });
  } catch (error) {
    console.error("Error fetching contact:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching contact",
    });
  }
};


/** ================================
 * UPDATE CONTACT
 ==================================*/
const updateContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, childIssue, message, website } = req.body;

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    // Validate childIssue
    if (childIssue) {
      const exists = await ChildIssue.findById(childIssue);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: "Invalid childIssue",
        });
      }
      contact.childIssue = childIssue;
    }

    // Validate duplicate email / phone
    if (email && email !== contact.email) {
      const emailExists = await Contact.findOne({ email });
      if (emailExists) {
        return res
          .status(409)
          .json({ success: false, message: "Email already in use" });
      }
    }

    if (phone && phone !== contact.phone) {
      const phoneExists = await Contact.findOne({ phone });
      if (phoneExists) {
        return res
          .status(409)
          .json({ success: false, message: "Phone already in use" });
      }
    }

    // Update fields
    contact.name = name?.trim() || contact.name;
    contact.email = email?.trim() || contact.email;
    contact.phone = phone?.trim() || contact.phone;
    contact.message = message?.trim() || contact.message;
    contact.website = website ?? contact.website;

    const updated = await contact.save();
    const populated = await updated.populate("childIssue");

    return res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      contact: populated,
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating",
    });
  }
};


/** ================================
 * DELETE CONTACT
 ==================================*/
const deleteContactById = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    await Contact.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return res.status(500).json({
      success: false,
      message: "Server error deleting contact",
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

const express = require('express');
const router = express.Router();
const {
    createContact,
    getAllContacts,
    getContactById,
    updateContactById,
    deleteContactById
} = require('../../controllers/ContactManagement/ContactUs.controller');


router.post('/', createContact);
router.get('/', getAllContacts);
router.get('/:id', getContactById);
router.patch('/:id', updateContactById);
router.delete('/:id', deleteContactById);

module.exports = router;


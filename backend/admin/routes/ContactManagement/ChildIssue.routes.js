const express = require('express');
const router = express.Router();
const {
    createChildIssue,
    getAllChildIssues,
    getChildIssueById,
    updateChildIssueById,
    deleteChildIssueById
} = require('../../controllers/ContactManagement/childIssue.controller');

router.post('/', createChildIssue);
router.get('/', getAllChildIssues);
router.get('/:id', getChildIssueById);
router.patch('/:id', updateChildIssueById);
router.delete('/:id', deleteChildIssueById);

module.exports = router;


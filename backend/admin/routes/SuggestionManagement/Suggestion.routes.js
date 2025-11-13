const express = require('express');
const router = express.Router();
const {
    createSuggestion,
    getAllSuggestions,
    getSuggestionById,
    updateSuggestionById,
    deleteSuggestionById
} = require('../../controllers/SuggestionManagement/Suggestion.controller');


router.post('/', createSuggestion);
router.post('/all', getAllSuggestions);
router.get('/:id', getSuggestionById);
router.patch('/:id', updateSuggestionById);
router.delete('/:id', deleteSuggestionById);

module.exports = router;


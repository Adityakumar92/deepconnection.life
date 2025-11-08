const express = require('express');
const router = express.Router();
const {
    createProgram,
    getAllPrograms,
    getProgramById,
    updateProgramById,
    deleteProgramById
} = require('../../controllers/BookingManagement/Program.controller');


router.post('/', createProgram);
router.get('/', getAllPrograms);
router.get('/:id', getProgramById);
router.patch('/:id', updateProgramById);
router.delete('/:id', deleteProgramById);

module.exports = router;


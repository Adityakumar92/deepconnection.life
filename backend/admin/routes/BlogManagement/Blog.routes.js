const express = require('express');
const router = express.Router();
const {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlogStatusById,
    updateBlogById,
    deleteBlogById
} = require('../../controllers/BlogManagement/Blog.controller');

router.post('/', createBlog);
router.post('/all', getAllBlogs);
router.get('/:id', getBlogById);
router.patch('/:id/status', updateBlogStatusById);
router.patch('/:id', updateBlogById);
router.delete('/:id', deleteBlogById);

module.exports = router;


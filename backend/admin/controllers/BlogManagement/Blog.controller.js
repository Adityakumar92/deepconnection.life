const Blog = require('../../models/blog/blog.model');

/**
 * ✅ Create a new Blog
 */
const createBlog = async (req, res) => {
    try {
        const {
            title,
            contentType,
            category,
            publicationStatus,
            content,
            authorName,
            authorPosition,
            readTime,
            image,
            tags
        } = req.body;

        // Validation
        if (!title || !contentType || !category || !content || !authorName || !authorPosition || !readTime) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        // Create and save blog
        const newBlog = new Blog({
            title: title.trim(),
            contentType: contentType.trim(),
            category: category.trim(),
            publicationStatus: publicationStatus || 'draft',
            content: content.trim(),
            authorName: authorName.trim(),
            authorPosition: authorPosition.trim(),
            readTime: readTime.trim(),
            image: image?.trim() || null,
            tags: tags || []
        });

        const savedBlog = await newBlog.save();

        res.status(201).json({
            success: true,
            message: 'Blog created successfully',
            blog: savedBlog
        });
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating blog'
        });
    }
};

/**
 * ✅ Get all Blogs
 */
const getAllBlogs = async (req, res) => {
    try {
        const { status, category, search } = req.query;

        const filters = {};
        if (status) filters.publicationStatus = status;
        if (category) filters.category = category;
        if (search) filters.$text = { $search: search };

        const blogs = await Blog.find(filters).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Blogs fetched successfully',
            total: blogs.length,
            blogs
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching blogs'
        });
    }
};

/**
 * ✅ Get Blog by ID
 */
const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Blog fetched successfully',
            blog
        });
    } catch (error) {
        console.error('Error fetching blog by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching blog by ID'
        });
    }
};

/**
 * ✅ Update Blog by ID
 */
const updateBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            contentType,
            category,
            publicationStatus,
            content,
            authorName,
            authorPosition,
            readTime,
            image,
            tags
        } = req.body;

        const existingBlog = await Blog.findById(id);
        if (!existingBlog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        existingBlog.title = title?.trim() || existingBlog.title;
        existingBlog.contentType = contentType?.trim() || existingBlog.contentType;
        existingBlog.category = category?.trim() || existingBlog.category;
        existingBlog.publicationStatus = publicationStatus || existingBlog.publicationStatus;
        existingBlog.content = content?.trim() || existingBlog.content;
        existingBlog.authorName = authorName?.trim() || existingBlog.authorName;
        existingBlog.authorPosition = authorPosition?.trim() || existingBlog.authorPosition;
        existingBlog.readTime = readTime?.trim() || existingBlog.readTime;
        existingBlog.image = image?.trim() || existingBlog.image;
        existingBlog.tags = tags || existingBlog.tags;

        const updatedBlog = await existingBlog.save();

        res.status(200).json({
            success: true,
            message: 'Blog updated successfully',
            blog: updatedBlog
        });
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating blog'
        });
    }
};

/**
 * ✅ Delete Blog by ID
 */
const deleteBlogById = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        await Blog.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Blog deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting blog'
        });
    }
};

module.exports = {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlogById,
    deleteBlogById
};

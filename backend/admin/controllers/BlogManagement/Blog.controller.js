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
            tags,
            status
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
            tags: tags || [],
            status: status || false
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
    const {
      status,               // approval flag (true/false)
      category,
      contentType,
      title,
      publicationStatus,
      authorName,
      tags,
      search,
    } = req.body;

    const filters = {};

    // 🟢 Direct field filters
    if (status !== undefined) {
      filters.status = status === "true"; // convert string to boolean
    }

    if (publicationStatus) {
      filters.publicationStatus = publicationStatus.trim();
    }

    if (contentType) {
      filters.contentType = { $regex: contentType, $options: "i" };
    }

    if (category) {
      filters.category = { $regex: category, $options: "i" };
    }

    if (title) {
      filters.title = { $regex: title, $options: "i" };
    }

    if (authorName) {
      filters.authorName = { $regex: authorName, $options: "i" };
    }

    if (tags) {
      // match any of provided tags (comma-separated)
      const tagArray = tags.split(",").map((t) => t.trim());
      filters.tags = { $in: tagArray };
    }

    // 🟢 General search — matches across multiple fields
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { authorName: { $regex: search, $options: "i" } },
        { authorPosition: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    // 🟢 Fetch and sort by newest first
    const blogs = await Blog.find(filters).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Blogs fetched successfully",
      total: blogs.length,
      blogs,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching blogs",
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

const updateBlogStatusById = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }
        blog.status = !blog.status;
        const updatedBlog = await blog.save();
        res.status(200).json({
            success: true,
            message: 'Blog status updated successfully',
            blog: updatedBlog
        });
    } catch (error) {
        console.error('Error updating blog status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating blog status'
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
            tags,
            status
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
        existingBlog.status = status !== undefined ? status : existingBlog.status;

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
    updateBlogStatusById,
    updateBlogById,
    deleteBlogById
};

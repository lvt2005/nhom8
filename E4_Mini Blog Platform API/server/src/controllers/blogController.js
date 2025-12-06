const Blog = require('../models/Blog');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

// Helper to map Sequelize instance to object with _id
const toResponse = (blog) => {
  if (!blog) return null;
  const blogJSON = blog.toJSON();
  blogJSON._id = blogJSON.id;
  if (blogJSON.user) {
    blogJSON.user._id = blogJSON.user.id;
  }
  return blogJSON;
};

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res, next) => {
  try {
    const { search, sort } = req.query;
    let where = {};

    // Search by title
    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    let order = [['createdAt', 'DESC']]; // Default desc
    if (sort) {
      const sortOrder = sort === 'asc' ? 'ASC' : 'DESC';
      order = [['createdAt', sortOrder]];
    }

    const blogs = await Blog.findAll({
      where,
      order,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email'],
        },
      ],
    });

    const response = blogs.map(toResponse);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get blog by id
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email'],
        },
      ],
    });

    if (!blog) {
      res.status(404);
      throw new Error('Blog not found');
    }

    res.status(200).json(toResponse(blog));
  } catch (error) {
    next(error);
  }
};

// @desc    Create blog
// @route   POST /api/blogs
// @access  Private
const createBlog = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;
    let image = '';

    if (req.file) {
      image = req.file.path; // Or just the filename if serving static
    }

    if (!title || !content) {
      res.status(400);
      throw new Error('Please add title and content');
    }

    const blog = await Blog.create({
      userId: req.user.id,
      title,
      content,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [],
      image: req.file ? `/uploads/${req.file.filename}` : '',
    });

    // Fetch again to include user info if needed, or just return what we have
    // Usually frontend needs user info immediately? 
    // Let's just return the blog with user id.
    // Or reload to get the user association.
    const fullBlog = await Blog.findByPk(blog.id, {
        include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }]
    });

    res.status(201).json(toResponse(fullBlog));
  } catch (error) {
    next(error);
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private
const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByPk(req.params.id);

    if (!blog) {
      res.status(404);
      throw new Error('Blog not found');
    }

    // Check for user
    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }

    // Make sure the logged in user matches the blog user
    if (blog.userId !== req.user.id && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('User not authorized');
    }

    const { title, content, tags } = req.body;
    
    let updatedData = {
      title: title || blog.title,
      content: content || blog.content,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : blog.tags,
    };

    if (req.file) {
        // Delete old image if exists
        if (blog.image) {
            const oldImagePath = path.join(__dirname, '../../', blog.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        updatedData.image = `/uploads/${req.file.filename}`;
    }

    await blog.update(updatedData);
    
    const updatedBlog = await Blog.findByPk(req.params.id, {
        include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }]
    });

    res.status(200).json(toResponse(updatedBlog));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private
const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByPk(req.params.id);

    if (!blog) {
      res.status(404);
      throw new Error('Blog not found');
    }

    // Check for user
    if (!req.user) {
      res.status(401);
      throw new Error('User not found');
    }

    // Make sure the logged in user matches the blog user
    if (blog.userId !== req.user.id && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('User not authorized');
    }

    if (blog.image) {
        const oldImagePath = path.join(__dirname, '../../', blog.image);
        if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
        }
    }

    await blog.destroy();

    res.status(200).json({ id: req.params.id, _id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};

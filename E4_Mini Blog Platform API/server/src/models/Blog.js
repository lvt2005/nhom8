const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Blog = sequelize.define('Blog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please add a title' },
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please add content' },
    },
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  tags: {
    type: DataTypes.JSON, // Storing tags as JSON array
    defaultValue: [],
  },
}, {
  timestamps: true,
});

// Define relationships
Blog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Blog, { foreignKey: 'userId' });

module.exports = Blog;

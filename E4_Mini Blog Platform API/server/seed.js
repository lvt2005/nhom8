const dotenv = require('dotenv');
dotenv.config();

const { sequelize, connectDB } = require('./src/config/db');
const User = require('./src/models/User');
const Blog = require('./src/models/Blog');

const seedData = async () => {
  try {
    // Connect to DB
    await sequelize.authenticate();
    console.log('MySQL Connected...');

    // Sync with force: true to clear data and recreate tables
    await sequelize.sync({ force: true });
    console.log('Database synced and cleared...');

    // Create User
    const user = await User.create({
      username: 'demo_user',
      email: 'demo@example.com',
      password: 'password123', // Will be hashed by hook
      role: 'user'
    });

    console.log('User created:', user.username);

    // Create Blogs
    const blogs = [
      {
        userId: user.id,
        title: 'Getting Started with Vue 3 and Vite',
        content: 'Vue 3 is the latest version of the progressive JavaScript framework. It features a new Composition API, better performance, and smaller bundle sizes. Vite is a build tool that aims to provide a faster and leaner development experience for modern web projects.',
        tags: ['vue', 'vite', 'frontend'],
        image: ''
      },
      {
        userId: user.id,
        title: 'Building REST APIs with Node.js and Express',
        content: 'Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. It is the de facto standard server framework for Node.js.',
        tags: ['nodejs', 'express', 'backend'],
        image: ''
      }
    ];

    await Blog.bulkCreate(blogs);

    console.log('Sample blogs created...');
    
    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

seedData();

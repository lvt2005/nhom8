const db = require('../models');
const User = db.User;
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send({ message: 'Username and password are required.' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).send({ message: 'Username already exists.' });
    }

    // Create user (In production, hash password!)
    const user = await User.create({
      username,
      password // Storing plain text as per simple requirements, but normally use bcrypt
    });

    res.send({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }

    if (user.password !== password) {
      return res.status(401).send({ message: 'Invalid password.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: 86400 // 24 hours
    });

    res.status(200).send({
      id: user.id,
      username: user.username,
      accessToken: token
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

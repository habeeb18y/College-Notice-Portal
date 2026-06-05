const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByEmail, createUser } = require('../models/queries');
require('dotenv').config();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, class_id } = req.body;
    
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role,
      class_id: role === 'student' ? class_id : null
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        class_id: user.class_id
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      message: 'Login successful',
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        class_id: user.class_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

const logout = (req, res) => {
  res.json({ message: 'Logout successful' });
};

const getProfile = async (req, res) => {
  try {
    const { findUserById } = require('../models/queries');
    const user = await findUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't send password
    const { password, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile
};

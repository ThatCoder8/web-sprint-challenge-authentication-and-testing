const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../users/users-model.js');

const JWT_SECRET = process.env.JWT_SECRET || 'keepitsecret,keepitsafe!';

router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'username and password required' 
      });
    }
    
    const user = await Users.findBy({ username }).first();
    
    if (user) {
      return res.status(400).json({ 
        message: 'username taken' 
      });
    }
    
    const newUser = await Users.add({
      username,
      password: bcrypt.hashSync(password, 8) // Using 2^8 rounds as specified
    });
    
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'username and password required'
      });
    }
    
    const user = await Users.findBy({ username }).first();
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({
        message: 'invalid credentials'
      });
    }
    
    const token = jwt.sign({
      subject: user.id,
      username: user.username
    }, JWT_SECRET, { expiresIn: '1d' });
    
    res.json({
      message: `Welcome, ${user.username}!`,
      token
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
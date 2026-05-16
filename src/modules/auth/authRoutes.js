const express = require('express');
const { body } = require('express-validator');
const { registerController, loginController, logoutController } = require('./authController');
const validate = require('../../middleware/validate');

const router = express.Router();

// Input validation rules using express-validator
// These run before the controller — bad input never reaches business logic

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('orgName').notEmpty().withMessage('Organization name is required'),
  ],
  validate,
  registerController
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  loginController
);

router.post('/logout', logoutController);

module.exports = router;
const { validationResult } = require('express-validator');

// Reusable middleware — runs after express-validator rules
// If any rule failed, returns 422 with all error messages
// If clean, calls next() to proceed to the controller

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = validate;
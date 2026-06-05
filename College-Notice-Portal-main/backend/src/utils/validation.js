const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .isIn(['admin', 'faculty', 'student'])
    .withMessage('Role must be admin, faculty, or student'),
  
  body('class_id')
    .optional()
    .isUUID()
    .withMessage('Class ID must be a valid UUID'),
  
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validateNotice = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('message')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Message must be at least 10 characters long'),
  
  body('notice_type')
    .isIn(['ALL', 'FACULTY', 'CLASS'])
    .withMessage('Notice type must be ALL, FACULTY, or CLASS'),
  
  body('class_id')
    .if(body('notice_type').equals('CLASS'))
    .notEmpty()
    .withMessage('Class ID is required when notice type is CLASS')
    .isUUID()
    .withMessage('Class ID must be a valid UUID'),
  
  body('class_id')
    .if(body('notice_type').not().equals('CLASS'))
    .optional()
    .isEmpty()
    .withMessage('Class ID should only be provided when notice type is CLASS'),
  
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('role')
    .optional()
    .isIn(['admin', 'faculty', 'student'])
    .withMessage('Role must be admin, faculty, or student'),
  
  body('class_id')
    .optional()
    .isUUID()
    .withMessage('Class ID must be a valid UUID'),
  
  handleValidationErrors
];

const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  handleValidationErrors
];

const validateClass = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Class name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-]+$/)
    .withMessage('Class name can only contain letters, numbers, spaces, and hyphens'),
  
  handleValidationErrors
];

const validateFacultyAssignment = [
  body('faculty_id')
    .isUUID()
    .withMessage('Faculty ID must be a valid UUID'),
  
  body('class_id')
    .isUUID()
    .withMessage('Class ID must be a valid UUID'),
  
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateNotice,
  validateUserUpdate,
  validateProfileUpdate,
  validateClass,
  validateFacultyAssignment,
  handleValidationErrors
};

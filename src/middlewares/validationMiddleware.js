const { body, validationResult } = require('express-validator');
const { HTTP_STATUS } = require('../utils/constants');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ errors: errors.array() });
  }
  next();
};

const validateCreateStudent = [
  body('student_name').notEmpty().withMessage('Nome é obrigatório').isLength({ max: 45 }),
  body('student_cpf').optional().isLength({ max: 15 }),
  body('student_email').isEmail().withMessage('E-mail inválido').isLength({ max: 45 }),
  body('student_birthday').optional().isString(),
  body('student_status').optional().isInt({ min: 0, max: 2 }),
  validate
];

const validateUpdateStudent = [
  body('student_name').optional().notEmpty().isLength({ max: 45 }),
  body('student_cpf').isLength({ max: 15 }),
  body('student_email').optional().isEmail().isLength({ max: 45 }),
  body('student_birthday').optional().isString(),
  body('student_status').optional().isInt({ min: 0, max: 2 }),
  validate
];

module.exports = {
  validateCreateStudent,
  validateUpdateStudent
};
const asyncHandler = require('express-async-handler');
const { body } = require('express-validator');
const validate = require('./validate');
const Team = require('../models/Team');

const checkTeam = asyncHandler(async (req, res, next) => {
  const currentYear = new Date().getUTCFullYear();

  const validations = [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('You must specify a name')
      .isLength({ max: 30 })
      .withMessage('Name cannot be longer than 30 characters')
      .custom(async (value) => {
        const existingTeam = await Team.find({ name: value }).collation({
          locale: 'en',
          strength: 2,
        });

        if (existingTeam.length) {
          throw new Error('Team with this name already exists');
        }
      }),
    body('location')
      .trim()
      .notEmpty()
      .withMessage('You must specify a location')
      .isLength({ max: 30 })
      .withMessage('Location cannot be longer than 30 characters'),
    body('established')
      .notEmpty()
      .withMessage('You must specify a year of establishment')
      .bail()
      .isInt({ min: 1891, max: currentYear, allow_leading_zeroes: false })
      .withMessage(`Year must be between 1891 and ${currentYear}`),
  ];

  await validate(validations, req);

  next();
});

module.exports = checkTeam;

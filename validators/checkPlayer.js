const asyncHandler = require('express-async-handler');
const { body } = require('express-validator');
const luxon = require('luxon');
const validate = require('./validate');
const Player = require('../models/Player');
const Team = require('../models/Team');

const countryCodes = require('../data/countries.json').map(
  (country) => country.code,
);

const checkPlayer = asyncHandler(async (req, res, next) => {
  const minDate = luxon.DateTime.utc().plus({ years: -100 }).toISODate();
  const maxDate = luxon.DateTime.utc().plus({ years: -10 }).toISODate();

  const validations = [
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('You must specify a first name')
      .isLength({ max: 30 })
      .withMessage('First name cannot be longer than 30 characters'),
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('You must specify a last name')
      .isLength({ max: 30 })
      .withMessage('Last name cannot be longer than 30 characters'),
    body('team')
      .optional({ values: 'falsy' })
      .isMongoId()
      .withMessage('Team is not a valid MongoId')
      .bail()
      .custom(async (value) => {
        const team = await Team.findById(value);

        if (!team) {
          throw new Error('Selected team does not exist');
        }
      }),
    body('number')
      .notEmpty()
      .withMessage('You must specify a number')
      .bail()
      .not()
      .contains('.')
      .withMessage('Number cannot contain a dot')
      .bail()
      .custom((value) => {
        if (['00', '0'].includes(value)) return true;
        if (
          !value.startsWith('0') &&
          Number.isInteger(+value) &&
          +value >= 1 &&
          +value <= 99
        ) {
          return true;
        }

        throw new Error('You must specify a valid number (00, 0-99)');
      })
      .custom(async (value, { req }) => {
        if (req.body.team) {
          const conflictingPlayer = await Player.findOne({
            team: req.body.team,
            number: value,
          });

          if (
            conflictingPlayer &&
            conflictingPlayer._id.toString() !== req.params.id
          ) {
            throw new Error(
              `This number is taken by ${conflictingPlayer.full_name}`,
            );
          }
        }
      }),
    body('position')
      .notEmpty()
      .withMessage('You must specify a position')
      .bail()
      .isIn(['PG', 'SG', 'SF', 'PF', 'C'])
      .withMessage('Selected position is invalid'),
    body('height')
      .notEmpty()
      .withMessage('You must specify a height')
      .bail()
      .isInt({ min: 120, max: 240, allow_leading_zeroes: false })
      .withMessage('Height must be between 120 and 240 cm'),
    body('weight')
      .notEmpty()
      .withMessage('You must specify a weight')
      .bail()
      .isInt({ min: 50, max: 250, allow_leading_zeroes: false })
      .withMessage('Weight must be between 50 and 250 kg'),
    body('country')
      .notEmpty()
      .withMessage('You must specify a country')
      .bail()
      .custom((value) => countryCodes.includes(value))
      .withMessage('Selected country is invalid'),
    body('dateOfBirth')
      .notEmpty()
      .withMessage('You must specify a date of birth')
      .bail()
      .isISO8601()
      .withMessage('Specified date is invalid')
      .bail()
      .isAfter(minDate)
      .withMessage('Player cannot be older than 100')
      .isBefore(maxDate)
      .withMessage('Player must be at least 10 years old'),
    body('photo').custom(() => {
      const value = req.file;
      const { sizeError } = res.locals;

      if (value && !['image/jpeg', 'image/png'].includes(value.mimetype)) {
        throw new Error('Photo must be JPG or PNG format');
      }

      if (sizeError) {
        throw new Error('Photo cannot be bigger than 2 MB');
      }

      return true;
    }),
    body('deletePhoto').toBoolean(),
  ];

  await validate(validations, req);

  next();
});

module.exports = checkPlayer;

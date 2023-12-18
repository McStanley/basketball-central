const asyncHandler = require('express-async-handler');
const { matchedData, validationResult } = require('express-validator');

const Player = require('../models/Player');
const Team = require('../models/Team');

const checkPlayer = require('../validators/checkPlayer');

const countries = require('../data/countries.json');

exports.list = asyncHandler(async (req, res, next) => {
  const players = await Player.find({})
    .select({ first_name: 1, last_name: 1, number: 1, position: 1 })
    .populate('team')
    .sort({ last_name: 1, first_name: 1 })
    .exec();

  res.render('players/list', {
    title: 'Players',
    players,
  });
});

exports.details = asyncHandler(async (req, res, next) => {
  const player = await Player.findById(req.params.id).populate('team').exec();

  if (!player) {
    const error = new Error('Player not found');
    error.status = 404;
    next(error);
    return;
  }

  res.render('players/details', {
    title: player.full_name,
    player,
  });
});

exports.create_GET = asyncHandler(async (req, res, next) => {
  const teams = await Team.find({})
    .select({ name: 1 })
    .sort({ name: 1 })
    .exec();

  res.render('players/form', {
    title: 'New player',
    teams,
    countries,
  });
});

exports.create_POST = [
  checkPlayer,
  asyncHandler(async (req, res, next) => {
    const result = validationResult(req);
    const {
      firstName,
      lastName,
      team,
      number,
      position,
      height,
      weight,
      country,
      dateOfBirth,
    } = matchedData(req, { onlyValidData: false });

    if (!result.isEmpty()) {
      const teams = await Team.find({})
        .select({ name: 1 })
        .sort({ name: 1 })
        .exec();

      res.render('players/form', {
        title: 'New player',
        firstName,
        lastName,
        teams,
        selectedTeam: team,
        number,
        selectedPosition: position,
        height,
        weight,
        countries,
        selectedCountry: country,
        dateOfBirth,
        errors: result.array(),
      });

      return;
    }

    const newPlayer = new Player({
      first_name: firstName,
      last_name: lastName,
      team,
      number,
      position,
      height,
      weight,
      country,
      date_of_birth: dateOfBirth,
    });

    await newPlayer.save();

    res.redirect(newPlayer.url);
  }),
];

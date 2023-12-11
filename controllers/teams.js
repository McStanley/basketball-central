const asyncHandler = require('express-async-handler');
const { matchedData, validationResult } = require('express-validator');

const Team = require('../models/Team');
const Player = require('../models/Player');

const checkTeam = require('../validators/checkTeam');

exports.list = asyncHandler(async (req, res, next) => {
  const teams = await Team.find({}).sort({ name: 1 }).exec();

  res.render('teams/list', {
    title: 'Teams',
    teams,
  });
});

exports.details = asyncHandler(async (req, res, next) => {
  const [team, players] = await Promise.all([
    Team.findById(req.params.id).exec(),
    Player.find({ team: req.params.id })
      .select({ first_name: 1, last_name: 1, number: 1, position: 1 })
      .sort({ last_name: 1, first_name: 1 })
      .exec(),
  ]);

  if (!team) {
    const error = new Error('Team not found');
    error.status = 404;
    next(error);
    return;
  }

  res.render('teams/details', {
    title: team.name,
    team,
    players,
  });
});

exports.create_GET = asyncHandler(async (req, res, next) => {
  res.render('teams/form', {
    title: 'New team',
  });
});

exports.create_POST = [
  checkTeam,
  asyncHandler(async (req, res, next) => {
    const result = validationResult(req);
    const { name, location, established } = matchedData(req, {
      onlyValidData: false,
    });

    if (!result.isEmpty()) {
      res.render('teams/form', {
        title: 'New team',
        name,
        location,
        established,
        errors: result.array(),
      });

      return;
    }

    const newTeam = new Team({
      name,
      location,
      established_year: established,
    });

    await newTeam.save();

    res.redirect(newTeam.url);
  }),
];

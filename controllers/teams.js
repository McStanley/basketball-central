const asyncHandler = require('express-async-handler');

const Team = require('../models/Team');
const Player = require('../models/Player');

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

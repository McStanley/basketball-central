const asyncHandler = require('express-async-handler');

const Player = require('../models/Player');

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

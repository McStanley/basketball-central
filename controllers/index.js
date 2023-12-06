const asyncHandler = require('express-async-handler');

const Team = require('../models/Team');
const Player = require('../models/Player');

exports.home = asyncHandler(async (req, res, next) => {
  const [teamsCount, playersCount] = await Promise.all([
    Team.countDocuments({}).exec(),
    Player.countDocuments({}).exec(),
  ]);

  res.render('home', {
    title: 'Basketball Central',
    teamsCount,
    playersCount,
  });
});

const asyncHandler = require('express-async-handler');
const { matchedData, validationResult } = require('express-validator');
const luxon = require('luxon');

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

exports.update_GET = asyncHandler(async (req, res, next) => {
  const player = await Player.findById(req.params.id);

  if (!player) {
    const error = new Error('Player not found');
    error.status = 404;
    next(error);
    return;
  }

  const teams = await Team.find({})
    .select({ name: 1 })
    .sort({ name: 1 })
    .exec();

  const dateOfBirth = luxon.DateTime.fromJSDate(
    player.date_of_birth,
  ).toISODate();

  res.render('players/form', {
    title: `Update ${player.full_name}`,
    firstName: player.first_name,
    lastName: player.last_name,
    teams,
    selectedTeam: player.team?.toString(),
    number: player.number,
    selectedPosition: player.position,
    height: player.height,
    weight: player.weight,
    countries,
    selectedCountry: player.country,
    dateOfBirth,
    url: player.url,
  });
});

exports.update_POST = [
  checkPlayer,
  asyncHandler(async (req, res, next) => {
    const player = await Player.findById(req.params.id);

    if (!player) {
      const error = new Error('Player not found');
      error.status = 404;
      next(error);
      return;
    }

    const result = validationResult(req);
    const {
      firstName,
      lastName,
      team = null,
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
        title: `Update ${player.full_name}`,
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

    await player.updateOne({
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

    res.redirect(player.url);
  }),
];

exports.delete_GET = asyncHandler(async (req, res, next) => {
  const player = await Player.findById(req.params.id);

  if (!player) {
    const error = new Error('Player not found');
    error.status = 404;
    next(error);
    return;
  }

  res.render('players/delete', {
    title: `Delete ${player.full_name}`,
    url: player.url,
  });
});

exports.delete_POST = asyncHandler(async (req, res, next) => {
  const player = await Player.findById(req.params.id);

  if (!player) {
    const error = new Error('Player not found');
    error.status = 404;
    next(error);
    return;
  }

  await player.deleteOne();

  res.redirect('/players');
});

const asyncHandler = require('express-async-handler');
const { matchedData, validationResult } = require('express-validator');
const { getDownloadURL, getStorage } = require('firebase-admin/storage');

const upload = require('../middleware/upload');

const Team = require('../models/Team');
const Player = require('../models/Player');

const checkTeam = require('../validators/checkTeam');

const bucket = getStorage().bucket();

exports.list = asyncHandler(async (req, res, next) => {
  const teams = await Team.find({})
    .collation({ locale: 'en' })
    .sort({ name: 1 })
    .exec();

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
      .collation({ locale: 'en' })
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
  upload('logo'),
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

    const { file } = req;

    if (file) {
      const extensions = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
      };

      const bucketFile = bucket.file(
        `teams/${newTeam._id}.${extensions[file.mimetype]}`,
        {},
      );

      await bucketFile.save(file.buffer);

      const downloadUrl = await getDownloadURL(bucketFile);
      newTeam.logo = downloadUrl;
    }

    await newTeam.save();

    res.redirect(newTeam.url);
  }),
];

exports.update_GET = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    const error = new Error('Team not found');
    error.status = 404;
    next(error);
    return;
  }

  res.render('teams/form', {
    title: `Update ${team.name}`,
    name: team.name,
    location: team.location,
    established: team.established_year,
    logo: team.logo,
    url: team.url,
  });
});

exports.update_POST = [
  upload('logo'),
  checkTeam,
  asyncHandler(async (req, res, next) => {
    const team = await Team.findById(req.params.id);

    if (!team) {
      const error = new Error('Team not found');
      error.status = 404;
      next(error);
      return;
    }

    const result = validationResult(req);
    const { name, location, established, deleteLogo } = matchedData(req, {
      onlyValidData: false,
    });

    if (!result.isEmpty()) {
      res.render('teams/form', {
        title: `Update ${team.name}`,
        name,
        location,
        established,
        logo: team.logo,
        url: team.url,
        errors: result.array(),
      });

      return;
    }

    const teamUpdates = {
      name,
      location,
      established_year: established,
    };

    const { file } = req;

    if (file || deleteLogo) {
      await bucket.deleteFiles({ prefix: `teams/${team._id}` });
      teamUpdates.logo = null;
    }

    if (file) {
      const extensions = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
      };

      const bucketFile = bucket.file(
        `teams/${team._id}.${extensions[file.mimetype]}`,
        {},
      );

      await bucketFile.save(file.buffer);

      const downloadUrl = await getDownloadURL(bucketFile);
      teamUpdates.logo = downloadUrl;
    }

    await team.updateOne(teamUpdates);

    res.redirect(team.url);
  }),
];

exports.delete_GET = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    const error = new Error('Team not found');
    error.status = 404;
    next(error);
    return;
  }

  const playersCount = await Player.countDocuments({ team: team._id });

  res.render('teams/delete', {
    title: `Delete ${team.name}`,
    logo: team.logo,
    playersCount,
    url: team.url,
  });
});

exports.delete_POST = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    const error = new Error('Team not found');
    error.status = 404;
    next(error);
    return;
  }

  const playersCount = await Player.countDocuments({ team: team._id });

  if (playersCount) {
    const { action } = req.body;

    if (!['keep', 'delete'].includes(action)) {
      res.render('teams/delete', {
        title: `Delete ${team.name}`,
        logo: team.logo,
        playersCount,
        url: team.url,
        errors: [{ msg: 'You need to decide what to do with active players' }],
      });

      return;
    }

    if (action === 'keep') {
      await Player.updateMany({ team: team._id }, { team: null });
    } else {
      const players = await Player.find({ team: team._id })
        .select({ _id: 1 })
        .exec();

      for (const player of players) {
        await bucket.deleteFiles({ prefix: `players/${player._id}` });
      }

      await Player.deleteMany({ team: team._id });
    }
  }

  await bucket.deleteFiles({ prefix: `teams/${team._id}` });
  await team.deleteOne();

  res.redirect('/teams');
});

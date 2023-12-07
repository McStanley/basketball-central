const express = require('express');
const router = express.Router();

const teamsController = require('../controllers/teams');

router.get('/:id', teamsController.details);
router.get('/', teamsController.list);

module.exports = router;

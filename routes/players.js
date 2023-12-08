const express = require('express');
const router = express.Router();

const playersController = require('../controllers/players');

router.get('/:id', playersController.details);
router.get('/', playersController.list);

module.exports = router;

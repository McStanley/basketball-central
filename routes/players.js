const express = require('express');
const router = express.Router();

const playersController = require('../controllers/players');

router
  .route('/new')
  .get(playersController.create_GET)
  .post(playersController.create_POST);
router.get('/:id', playersController.details);
router.get('/', playersController.list);

module.exports = router;

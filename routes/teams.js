const express = require('express');
const router = express.Router();

const teamsController = require('../controllers/teams');

router
  .route('/new')
  .get(teamsController.create_GET)
  .post(teamsController.create_POST);
router.get('/:id', teamsController.details);
router.get('/', teamsController.list);

module.exports = router;

const express = require('express');
const router = express.Router();

const playersController = require('../controllers/players');

router
  .route('/new')
  .get(playersController.create_GET)
  .post(playersController.create_POST);
router
  .route('/:id/update')
  .get(playersController.update_GET)
  .post(playersController.update_POST);
router
  .route('/:id/delete')
  .get(playersController.delete_GET)
  .post(playersController.delete_POST);
router.get('/:id', playersController.details);
router.get('/', playersController.list);

module.exports = router;

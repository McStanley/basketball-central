const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
  res.render('home', { title: 'Basketball Central' });
});

module.exports = router;

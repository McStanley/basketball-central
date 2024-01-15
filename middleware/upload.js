const multer = require('multer');

const limits = { fileSize: 2097152 };

const upload = (field) => (req, res, next) =>
  multer({ limits }).single(field)(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.locals.sizeError = true;
      next();
    } else if (err) {
      next(err);
    } else {
      next();
    }
  });

module.exports = upload;

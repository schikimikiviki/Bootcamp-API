const errorResponse = require('../utils/errorResponse');

const errorHandler = (err, res, req, next) => {
  let error = { ...err };

  error.message = err.message;

  //Mongoose bad ObjectID
  if (err.name === 'CastError') {
    const message = `Ressource not found with id: ${err.value}`;
    error = new errorResponse(message, 404);
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || 'Server error' });
};

module.exports = errorHandler;

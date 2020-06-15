const ErrorResponse = require("../utils/ErrorResponse");
const errorHandler = (err, req, res, next) => {
  // Log to console for devs
  console.error(err);

  let error = { ...err };
  error.message = err.message; // err.message is not a numerable prop, can't be spread in

  // Mongoose bad ObjectId, mongoose attached req.params.id into error.value
  if (err.name === "CastError") {
    const message = `Resource not found`;
    // Change the error from CastError 500 to 404
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = new ErrorResponse(message, 400);
  }
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server error",
  });
};

module.exports = errorHandler;

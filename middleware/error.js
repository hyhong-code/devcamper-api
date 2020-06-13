const ErrorResponse = require("../utils/ErrorResponse");
const errorHandler = (err, req, res, next) => {
  // Log to console for devs
  console.log(err.stack.red);

  let error = { ...err };
  error.message = err.message; // err.message is not a numerable prop, can't be spread in

  // Mongoose bad ObjectId, mongoose attached req.params.id into error.value
  if (err.name === "CastError") {
    const message = `Resource not found with id of ${err.value}`;

    // Change the error from CastError 500 to 404
    error = new ErrorResponse(message, 404);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server error",
  });
};

module.exports = errorHandler;

const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/ErrorResponse");
const User = require("../models/User");

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; // Becasue Bearer ...
  }

  //   else if (req.cookie.token) {
  //     token = req.cookie.token;
  //   }

  // Check if token exsits
  if (!token) {
    return next(new ErrorResponse(`Not authorized to access this route`, 401));
  }

  // Verify token
  // decoded format: format: { id: '5ee65536407736a615ce6c16', iat: 1592158754, exp: 1594750754 }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach currently logged in user to req.user
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return next(new ErrorResponse(`Not authorized to access this route`, 401));
  }
});

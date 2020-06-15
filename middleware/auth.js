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
    // Set token from Bearer token header
    token = req.headers.authorization.split(" ")[1]; // Becasue Bearer ...
  }

  // else if (req.cookies.token) {
  //   // Set token from cookie
  //   token = req.cookies.token;
  // }

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

// Grant acess to specific roles
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(
      new ErrorResponse(
        `User role ${req.user.role} is not authorized to access this route`,
        403
      )
    );
  }
  next();
};

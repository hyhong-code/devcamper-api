const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// @desc    Register a user
// @route   POST /api/v1/auth/register
// @access  Public
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  sendTokenResponse(user, 200, res);
});

// @desc    Login a user
// @route   POST /api/v1/auth/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & passwrod - because model not used here
  if (!(email && password)) {
    return next(new ErrorResponse(`Please provide email and password`, 400));
  }

  // Check if user exists
  const user = await User.findOne({ email }).select("+password"); // because select:false in User model
  if (!user) {
    return next(new ErrorResponse(`Invalid Credentials`, 401));
  }

  // Check if password match with User model method
  const match = await user.verifyPasswrod(password);
  if (!match) {
    return next(new ErrorResponse(`Invalid Credentials`, 401));
  }

  sendTokenResponse(user, 200, res);
});

// Sign a token and send it to client in cookie
const sendTokenResponse = (user, statusCode, res) => {
  // Get token from User model method
  const token = user.getSignedJwtToken();

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    // clients not allow client-side JavaScript to see the cookie in document.cookie
  };

  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({ success: true, token });
};

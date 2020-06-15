const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

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
  const match = await user.verifyPassword(password);
  if (!match) {
    return next(new ErrorResponse(`Invalid Credentials`, 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get currenet logged in user info
// @route   POST /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // Password is not in response because select:false in User model
  res.status(200).json({ success: true, data: req.user });
});

// @desc    Update user details (name & email only)
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  // Password is not in response because select:false in User model
  res.status(200).json({ success: true, data: user });
});

// @desc    Update password (takes in cur and new password)
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check currrent password
  if (!(await user.verifyPassword(req.body.curPassword))) {
    return next(new ErrorResponse(`Password is incorrect`, 401));
  }

  // Update
  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(
      new ErrorResponse(`No user associated with email ${email}`, 404)
    );
  }

  // Attach reset token to user
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) 
  has requested the reset of a password. Please make a PUT request to: \n\n ${resetURL}`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });
    res.status(200).json({ success: true, data: "Email sent" });
  } catch (error) {
    console.error(error);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse(`Email can not be sent`, 500));
  }
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  // Check token is equal, and not expired
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse(`Invalid token`, 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

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

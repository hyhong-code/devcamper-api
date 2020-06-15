const ErroeResponse = require("../utils/ErrorResponse");
const asyncHandler = require("../middleware/async.js");
const Review = require("../models/Review");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/ErrorResponse");

// @desc    Get reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    return res
      .status(200)
      .json({ success: true, count: reviews.length, data: reviews });
  }

  res.status(200).json(res.advancedResults);
});

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!review) {
    return next(new ErrorResponse(`No review with id ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: review });
});

// @desc    Get single review
// @route   POST /api/v1/bootcamp/:bootcampId/reviews
// @access  Public
exports.createReview = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with id ${req.params.bootcampId}`, 404)
    );
  }
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const review = await Review.create(req.body);

  res.status(201).json({ success: true, data: review });
});

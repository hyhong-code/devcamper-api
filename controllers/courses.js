const ErrorResponse = require("../utils/ErrorResponse");
const Course = require("../models/Course");
const asyncHandler = require("../middleware/async");

// @desc    Get courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;
  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else {
    query = Course.find().populate({
      path: "bootcamp", // this is the name of the field inside courses model
      select: "name description",
    });
  }
  const courses = await query.exec();
  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

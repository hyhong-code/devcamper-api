const express = require("express");
const {
  getCourses,
  getCourseById,
  addCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courses");

const Course = require("../models/Course");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router({ mergeParams: true }); // Merge url params

router
  .route("/")
  .get(advancedResults(Course, "bootcamp"), getCourses)
  .post(addCourse);

router.route("/:id").get(getCourseById).put(updateCourse).delete(deleteCourse);

module.exports = router;

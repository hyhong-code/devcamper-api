const express = require("express");
const {
  getCourses,
  getCourseById,
  addCourse,
} = require("../controllers/courses");

const router = express.Router({ mergeParams: true }); // Merge url params

router.route("/").get(getCourses).post(addCourse);

router.route("/:id").get(getCourseById);

module.exports = router;

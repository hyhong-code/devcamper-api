const express = require("express");
const { getCourses } = require("../controllers/courses");

const router = express.Router({ mergeParams: true }); // Merge url params

router.route("/").get(getCourses);

module.exports = router;

const express = require("express");
const {
  getReviews,
  getReview,
  createReview,
} = require("../controllers/reviews");
const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");
const Review = require("../models/Review");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(advancedResults(Review), getReviews)
  .post(protect, authorize("user"), createReview);
router.route("/:id").get(getReview);

module.exports = router;

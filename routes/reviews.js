const express = require("express");
const {
  getReviews,
  getReview,
  createReview,
  updateReview,
} = require("../controllers/reviews");
const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");
const Review = require("../models/Review");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(advancedResults(Review), getReviews)
  .post(protect, authorize("user"), createReview);
router.route("/:id").get(getReview).put(protect, updateReview);

module.exports = router;

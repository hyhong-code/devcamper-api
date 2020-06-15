const express = require("express");
const advancedResults = require("../middleware/advancedResults");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/users");

// Use these 2 middlewares for all following routes
router.use(protect);
router.use(authorize("admin"));

router.route("/").get(advancedResults(User), getUsers).post(createUser);
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;

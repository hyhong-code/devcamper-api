const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
} = require("../controllers/auth");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/me", protect, getMe);
router.post("/forgotpassword", forgotPassword);

module.exports = router;

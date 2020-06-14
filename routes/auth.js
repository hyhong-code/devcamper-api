const express = require("express");
const { registerUser } = require("../controllers/auth");

const router = express.Router();

router.get("/register", registerUser);

module.exports = router;

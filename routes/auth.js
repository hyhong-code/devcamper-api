const express = require("express");
const { registerUser, loginUser } = require("../controllers/auth");

const router = express.Router();

router.get("/login", loginUser).post("/register", registerUser);

module.exports = router;

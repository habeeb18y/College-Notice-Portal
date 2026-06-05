const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { validateLogin, validateRegister } = require("../utils/validation");
const { authenticateToken } = require("../middleware/auth"); // ✅ ADD THIS

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);
router.post("/logout", authController.logout);
router.get("/me", authenticateToken, authController.getProfile); // ✅ ADD authenticateToken

module.exports = router;

const express = require("express");
const { registerUser, authUser, allUsers, updateUserProfile} = require("../controllers/authController"); // Import allUsers
const { protect } = require("../middleware/authMiddleware"); // Import protect middleware

const router = express.Router();

// This line handles both Register (POST) and Search (GET)
router.route("/")
  .post(registerUser)
  .get(protect, allUsers); // <--- ADD THIS LINE (The GET request)

router.post("/login", authUser);
router.route("/profile").put(protect, updateUserProfile);

module.exports = router;
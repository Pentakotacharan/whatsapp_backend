const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { fetchCommunities } = require("../controllers/communityController");

const router = express.Router();

router.route("/").get(protect, fetchCommunities);

module.exports = router;
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getStatuses, createStatus } = require("../controllers/statusController");

const router = express.Router();

router.route("/")
  .get(protect, getStatuses)
  .post(protect, createStatus);

module.exports = router;
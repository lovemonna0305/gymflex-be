const express = require("express");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.route("/").get(protect);

module.exports = router;

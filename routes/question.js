const express = require("express");
const { protect } = require("../middleware/auth");
const { getQuestions } = require("../controllers/question");
const router = express.Router();

router.route("/").get(protect, getQuestions);

module.exports = router;

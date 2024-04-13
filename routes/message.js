const express = require("express");
const { allMessages, sendMessage, unreadNumMessage } = require("../controllers/message.js");
const router = express.Router();

router.route("/:id").get(allMessages);
router.route("/unread/:id").get(unreadNumMessage);
router.route("/").post(sendMessage);

module.exports = router;
const express = require("express");
const router = express.Router();

const {
  getChat,
  getChats,
  createGroup,
  renameGroup,
  removeFromGroup,
  addUserToGroup,
} = require("../controllers/chat");

router.route("/:id").get(getChat);
router.route("/chats/:id").get(getChats);
router.route("/createGroup").post(createGroup);
router.route("/renameGroup").patch(renameGroup);
router.route("/removeFromGroup").patch(removeFromGroup);
router.route("/addUserToGroup").patch(addUserToGroup);

module.exports = router;
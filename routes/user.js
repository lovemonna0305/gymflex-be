const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getUser,
  getUsers,
  sendfriendrequest,
  getfriendrequest,
  getfriendrequests,
  acceptfriendrequest,
  rejectfriendrequest,
  unfriend,
} = require("../controllers/user");
const { updateUser } = require("../controllers/user");
const router = express.Router();

router.route("/:id/get").get(protect, getUser);
router.route("/all").get(protect, getUsers);
router.route("/updateUser").post(protect, updateUser);
router.route("/sendfriendrequest/:id").get(protect, sendfriendrequest);
router.route("/getfriendrequests").get(protect, getfriendrequests);
router.route("/getfriendrequest/:id").get(protect, getfriendrequest);
router.route("/acceptfriendrequest/:id").get(protect, acceptfriendrequest);
router.route("/rejectfriendrequest/:id").get(protect, rejectfriendrequest);
router.route("/unfriend/:id").get(protect, unfriend);

module.exports = router;

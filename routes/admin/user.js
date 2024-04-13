const express = require("express");
const { protect, onlyAdmin } = require("../../middleware/auth");
const {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require("../../controllers/admin/user");
const router = express.Router();

router.route("/").get(protect, getUsers);
router.route("/").post(protect, createUser);
router.route("/:id").get(protect, getUser);
router.route("/:id").post(protect, updateUser);
router.route("/:id").delete(protect, deleteUser);

module.exports = router;

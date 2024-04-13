const express = require("express");
const { protect, onlyAdmin } = require("../middleware/auth");
const {
  getGyms,
  createGym,
  getGym,
  updateGym,
  deleteGym,
} = require("../controllers/gym");
const router = express.Router();

router.route("/").get(protect, getGyms);
router.route("/").post(protect, createGym);
router.route("/:id").get(protect, getGym);
router.route("/:id").post(protect, updateGym);
router.route("/:id").delete(protect, deleteGym);

module.exports = router;

const Profile = require("../models/Profile");
const Gym = require("../models/Gym");
const jwt = require("jsonwebtoken");

exports.getGyms = async (req, res, next) => {
  try {
    const gyms = await Gym.find({});
    res.status(200).json({
      success: true,
      gyms,
    });
  } catch (err) {
    next(err);
  }
};

exports.createGym = async (req, res, next) => {
  try {
    var data = req.body;
    const gym = await Gym.create(data);
    res.status(200).json({ success: true, gym: gym });
  } catch (err) {
    next(err);
  }
};

exports.getGym = async (req, res, next) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) return next(new ErrorResponse(404, "Gym not found"));
    res.status(200).json({ success: true, gym });
  } catch (err) {
    next(err);
  }
};

exports.updateGym = async (req, res, next) => {
  try {
    var data = req.body;
    data.updatedAt = new Date();
    await Gym.findById(req.params.id).updateMany(data);
    const gym = await Gym.findById(req.params.id);
    res.status(200).json({ success: true, gym: gym });
  } catch (err) {
    next(err);
  }
};

exports.deleteGym = async (req, res, next) => {
  try {
    await Gym.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Gym deleted successfully." });
  } catch (err) {
    next(err);
  }
};

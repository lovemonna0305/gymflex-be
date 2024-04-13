const Profile = require("../../models/Profile");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");

exports.getUsers = async (req, res, next) => {
  try {
    let token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    const user = await User.findById(decoded._id);

    const users = await User.find({});
    res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    var data = req.body;
    const user = await User.create(data);
    res.status(200).json({ success: true, user: user });
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ErrorResponse(404, "Profile not found"));
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    var data = req.body;
    data.updatedAt = new Date();
    await User.findById(req.params.id).updateMany(data);
    const user = await User.findById(req.params.id);
    res.status(200).json({ success: true, user: user });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Profile.deleteMany({ user: req.params.id });
    // await Project.deleteMany({ user: req.params.id });
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully." });
  } catch (err) {
    next(err);
  }
};
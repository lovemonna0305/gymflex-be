const Profile = require("../models/Profile");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");

exports.updateProfile = async (req, res, next) => {
  const { user } = req;
  var data = req.body;
  data.updatedAt = new Date();
  var resProfile;
  try {
    if (user.profile) {
      await Profile.findById(req.params.id).updateMany(data);
      resProfile = await Profile.findById(req.user.profile);
    } else {
      var profile = await Profile.create(data);
      profile.user = user._id;
      user.profile = profile._id;
      await user.save();
      await profile.save();
      resProfile = profile;
    }
    res.status(200).json({ success: true, profile: resProfile });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) return next(new ErrorResponse(404, "Profile not found"));
    res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

exports.createProfile = async (req, res, next) => {
  try {
    const profile = await Profile.create(req.body);
    profile.user = req.user._id;
    await profile.save();
    const user = await User.findById(req.user._id);
    user.profile = profile._id;
    await user.save();

    return res.status(200).json({ success: true, profile });
  } catch (err) {
    next(err);
  }
};

const mongoose = require("mongoose");
const User = require("../models/User");
const Profile = require("../models/Profile");
const Chat = require("../models/Chat");
const Message = require("../models/Message");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      const user = await User.create({
        fullname: "monna",
        role: "admin",
        isActive: true,
        skipOnboarding: true,
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      });

      const profile = await Profile.create({
        user: user._id,
        weight: 83,
        height: 186,
        gender: "male",
        language: "EN",
        age: 34,
      });

      user.profile = profile._id;
      await user.save();
    }
    console.log("MongoDB Connected");
  } catch (err) {
    next(err);
  }
};

module.exports = connectDB;

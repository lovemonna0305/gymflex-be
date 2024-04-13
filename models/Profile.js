const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  language: {
    type: String,
    // enum: ["EN-US", "EN-UK"]
  },

  age: {
    type: Number,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    // default: "male",
    // required: [true, "Please provide gender"],
  },
  height: {
    type: Number,
  },
  weight: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
    default: new Date(),
  },
});

const Profile = mongoose.model("Profile", ProfileSchema);

module.exports = Profile;

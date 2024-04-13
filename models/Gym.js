const mongoose = require("mongoose");

const GymSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide gym name"],
  },
  location: {
    type: String,
  },

  numbers: {
    type: String,
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

const Gym = mongoose.model("Gym", GymSchema);

module.exports = Gym;

const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");

const UserSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, "Please provide full name"],
  },
  role: {
    type: String,
    enum: ["admin", "trainee", "trainer", "localadmin", "staff"],
    default: "trainer",
  },
  location: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
    required: [true, "Please provide email address"],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },
  friendList: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
    default: new Date(),
  },
  skipOnboarding: {
    type: Boolean,
    default: false,
  },
  otp: String,
  accountActivationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  } else {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  }
});

UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Access Token
UserSchema.methods.getSignedJwtAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      profile: this.profile,
      fullname: this.fullname,
      email: this.email,
      isActive: this.isActive,
      isLocked: this.isLocked,
      role: this.role,
      location: this.location,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      skipOnboarding: this.skipOnboarding,
    },
    process.env.ACCESS_SECRET,
    {
      expiresIn: process.env.ACCESS_EXPIRE,
    }
  );
};

// Refresh Token
UserSchema.methods.getSignedJwtRefreshToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email },
    process.env.REFRESH_SECRET,
    {
      expiresIn: process.env.REFRESH_EXPIRE,
    }
  );
};

UserSchema.methods.getOtp = function () {
  const otp = otpGenerator.generate(4, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  this.otp = otp;
  // Set token expire date
  this.accountActivationExpire = Date.now() + 10 * (60 * 1000); // Ten Minutes

  return otp;
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token (private key) and save to database
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set token expire date
  this.resetPasswordExpire = Date.now() + 10 * (60 * 1000); // Ten Minutes

  return resetToken;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;

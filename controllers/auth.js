const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const Profile = require("../models/Profile");
const sendEmail = require("../utils/sendEmail");

// @desc    Login user
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  // Check if email and password is provided
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  try {
    // Check that user exists by email
    const user = await User.findOne({ email })
      .select("+password")
      .populate("friendList")
      .populate("profile");

    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // In active account
    if (!user.isActive) {
      return next(new ErrorResponse("Account Inactive", 401));
    }

    // Locked account
    if (user.isLocked) {
      return next(new ErrorResponse("Account Locked", 401));
    }

    // Check that password match
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    console.log("User Eamil Login->");
    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.loginGoogle = async (req, res, next) => {
  const { email } = req.body;
  // Check if email and password is provided
  if (!email) {
    return next(new ErrorResponse("Please provide an email", 400));
  }

  try {
    // Check that user exists by email
    const user = await User.findOne({ email })
      .populate("friendList")
      .populate("profile");

    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // In active account
    if (!user.isActive) {
      return next(new ErrorResponse("Account Inactive", 401));
    }

    // Locked account
    if (user.isLocked) {
      return next(new ErrorResponse("Account Locked", 401));
    }

    console.log("User Google Login->");
    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Register user
exports.register = async (req, res, next) => {
  console.log("resiger request data->");
  try {
    const user = await User.create(req.body);
    // sendToken(user, 200, res);

    // Send the activation link

    // Activation Token Gen and add to database hashed (private) version of token
    // const otp = user.getOtp();

    const profile = await Profile.create({});
    profile.user = user._id;
    await profile.save();
    user.profile = profile._id;
    await user.save();

    res.status(200).json({
      success: true,
      data: "Register Successfully!",
    });
  } catch (err) {
    next(err);
  }
};
exports.registerGoogle = async (req, res, next) => {
  try {
    const user = await User.create(req.body);

    const profile = await Profile.create({});
    profile.user = user._id;
    await profile.save();
    user.profile = profile._id;
    await user.save();

    res.status(200).json({
      success: true,
      data: "Register Successfully!",
    });

  } catch (err) {
    next(err);
  }
};

// @desc   Activate user account
exports.accountActivation = async (req, res, next) => {
  // Compare token in URL params to hashed token

  try {
    const user = await User.findOne({
      otp: req.params.otp,
      accountActivationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse("Invalid Activation Token", 400));
    }

    user.isActive = true;
    user.otp = undefined;
    user.accountActivationExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.resendOtpEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    // sendToken(user, 200, res);

    // Send the activation link

    // Activation Token Gen and add to database hashed (private) version of token
    const otp = user.getOtp();

    await user.save();

    // HTML Message
    const message = `
    <p>Dear <strong> ${user.fullname}</strong>,</p>

    <p>Thank you for registering with our fitnest app! We're excited to have you as a new member of our community.</p>
    
    <p>To activa
    te your account, please confirm this OTP code.</p>
    <p>This OTP code will expire after 10 mins.</p>
    
    <h2>${otp}</h2>
    
    Once your account is activated, you'll be able to log in to our website and enjoy all of the benefits of membership and our services.
    
    <p>If you have any questions or concerns, please don't hesitate to reach out to our customer support team at <strong>${process.env.COMPANY_SUPPORT_EMAIL}</strong> or <strong>${process.env.COMPANY_SUPPORT_PHONE}</strong>.</p>
    
    <p>Thank you again for joining us. We look forward to connecting with you soon!</p>
    
    <p>Best regards,</p>
    <h4><strong>${process.env.COMPANY_NAME}</strong></h4>
    `;
    try {
      await sendEmail({
        to: user.email,
        subject: "Account Activation",
        text: message,
      });

      res
        .status(200)
        .json({ success: true, data: "Account Activation Email Sent" });
    } catch (err) {
      next(err);

      user.otp = undefined;
      user.accountActivationExpire = undefined;

      await user.save();

      return next(
        new ErrorResponse("Account Activation Email could not be sent", 500)
      );
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot Password Initialization
exports.forgotPassword = async (req, res, next) => {
  // Send Email to email provided but first check if user exists
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse("No email could not be sent", 404));
    }

    // Reset Token Gen and add to database hashed (private) version of token
    const resetToken = user.getResetPasswordToken();

    await user.save();

    // Create reset url to email to provided email
    const resetUrl = `${process.env.FRONT_END}password-reset/${resetToken}`;

    // HTML Message
    const message = `
      <p>Dear <strong>${user.fullname}</strong>,</p>

      <p>We have received a request to reset the password for your account. If you did not initiate this request, please disregard this email.</p>

      <p>To reset your password, please click on the following link <a href=${resetUrl} clicktracking=off>${resetUrl}</a> and follow the instructions provided. Please note that this link is valid for the next ${process.env.PASSWORD_RESET_TIME}.</p>

      <p>If you are unable to click on the link above, please copy and paste the URL into your web browser.</p>

      <p>If you have any questions or concerns, please contact our customer support team at <strong>${process.env.COMPANY_SUPPORT_EMAIL}</strong> or <strong>${process.env.COMPANY_SUPPORT_PHONE}</strong>.</p>

      <p>Thank you,</p>
      <p><strong>${process.env.COMPANY_NAME}</strong></p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        text: message,
      });

      res.status(200).json({ success: true, data: "Email Sent" });
    } catch (err) {
      next(err);

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return next(new ErrorResponse("Email could not be sent", 500));
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Reset User Password
exports.resetPassword = async (req, res, next) => {
  // Compare token in URL params to hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse("Invalid Token", 400));
    }

    // Send Password changed email
    // HTML Message
    const message = `
    <p>Dear <strong>${user.fullname}</strong>,</p>

    <p>This is to inform you that your password has been changed as per your request or as a security measure for your account. We take the security and privacy of our users very seriously, and therefore, we have reset your password as a precautionary measure.</p>
    
    <p>If you did not request this change, please contact our support team immediately, and they will help you investigate the issue further. You can reach our support team at <strong>${process.env.COMPANY_SUPPORT_EMAIL}</strong> or <strong>${process.env.COMPANY_SUPPORT_PHONE}</strong>.</p>
    
    <p>If you have initiated the password change, you can now use your new password to log in to your account. Please ensure that you keep your password secure and do not share it with anyone.</p>
    
    <p>Thank you for using our services. If you have any further questions or concerns, please do not hesitate to contact us.</p>
    
    <p>Best regards,</p>
    <p><strong>${process.env.COMPANY_NAME}</strong></p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Your Password Has Been Changed",
        text: message,
      });

      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      res.status(201).json({
        success: true,
        data: "Password Updated Success",
      });
    } catch (err) {
      return next(new ErrorResponse("Set a stronger password", 400));
    }
  } catch (err) {
    next(err);
  }
};

// desc refresh a token
exports.refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return next(new ErrorResponse("No refresh token passed", 400));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    // todo: check if token is valid and return early
    const user = await User.findOne({ email: decoded.email });

    sendRefreshToken(user, 200, refreshToken, res);
  } catch (err) {
    next(err);
  }
};

const sendToken = (user, statusCode, res) => {
  const acccess = user.getSignedJwtAccessToken();
  const refresh = user.getSignedJwtRefreshToken();

  res.status(statusCode).json({
    sucess: true,
    tokens: { accessToken: acccess, refreshToken: refresh },
    user: user,
  });
};
const sendRefreshToken = (user, statusCode, originalRefreshToken, res) => {
  const acccess = user.getSignedJwtAccessToken();
  const refresh = user.getSignedJwtRefreshToken();
  res.status(statusCode).json({
    sucess: true,
    tokens: { accessToken: acccess, refreshToken: refresh },
    user: user,
  });
};

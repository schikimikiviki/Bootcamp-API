const errorResponse = require("../utils/errorResponse.js");
const asyncHandler = require("../middleware/async.js");
const User = require("../models/User.js");
const sendEmail = require("../utils/sendEmail.js");
const crypto = require("crypto");

//@desc     Register a user
//@route    POST /api/v1/auth/register
//@access   Public

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  //create token

  sendTokenResponse(user, 200, res);
});

//@desc     Login a user
//@route    POST /api/v1/auth/login
//@access   Public

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //validate email and pw
  if (!email || !password) {
    return next(
      new errorResponse("Please provide an email and a password", 400)
    );
  }

  //check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new errorResponse("Credentials invalid", 401));
  }

  //check if password matches

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new errorResponse("Credentials invalid", 401));
  }

  //create token

  sendTokenResponse(user, 200, res);
});

//@desc     GET a logged in user
//@route    POST /api/v1/auth/me
//@access   Private

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc     UPDATE user details
//@route    PUT /api/v1/auth/updatedetails
//@access   Private

exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findById(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc     Update password
//@route    PUT /api/v1/auth/updatepassword
//@access   Private

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  //check current password

  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new errorResponse("Password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

//@desc     Forgot Password
//@route    POST /api/v1/auth/forgotpassword
//@access   Public

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new errorResponse("There is no user with that email", 404));
  }

  // get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you requested the reset of a password. Please make a PUT request to: \n \n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({ success: true, data: "Email sent" });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new errorResponse("Email could not be sent", 500));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc     Reset password
//@route    PUT /api/v1/auth/resetpassword/:resettoken
//@access   Public

exports.resetPassword = asyncHandler(async (req, res, next) => {
  //get hashed token

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new errorResponse("Invalid token", 400));
  }

  // set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);
});

// get token from model

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NOVE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token: token });
};

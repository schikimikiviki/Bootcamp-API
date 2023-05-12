const errorResponse = require("../utils/errorResponse.js");
const asyncHandler = require("../middleware/async.js");
const User = require("../models/User.js");

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

/* eslint-disable prettier/prettier */
const { promisify } = require('util');
const crypto = require('crypto')
const jwt = require('jsonwebtoken');
const tours = require('../constants/index');
const catchAsync = require('../utils/catchAsync');
const createSendToken = require('../utils/createSendJWT');
const sendEmail = require('../utils/email');
const AppError = require('../utils/appError');
const User = require('../models/userModel');







const checkId = (req, res, next, val) => {
  // eslint-disable-next-line radix
  const id = parseInt(val);
  console.log(`Tour id is ${id}`);

  if (req.params.id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Tour not found',
    });
  }

  next();
};

const checkBody = (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({
      status: 'error',
      message: 'no name found',
    });
  }

  next();
};

const aliasTopTours = (req, res, next) => {
  req.query.limit = '3';
  req.query.sort = 'price, -ratingsAverage';
  req.query.fields = 'name, price, difficulty, summary, ratingsAverage';
  next();
};

// auth middleware
const protect = catchAsync(async (req, res, next) => {
  // 1. Get the jwt and check if its there
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  }

  if (!token) next(new AppError('You are not logged in, pls log in to get access', 401));
  // console.log(token)

  // 2. Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  const currentUser = await User.findById(decoded.id);

  // 3. Check if user still exists
  if (!currentUser) return next(new AppError('User does not exist', 400));

  // 4. check if the user changed password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(
      new AppError('User recently changed password, pls log in again', 401)
    );

  // Grant access to protected route
  req.user = currentUser;
  next();
});

// Access control Middleware
const restrictTo = (...roles) => (req, res, next) => {
    // roles = ['admin', 'lead-guide']
    if (!roles.includes(req.user.role))
      next(
        new AppError('You do not have permission to perfom this action', 403)
      );

    next();
  };

const forgotPassword = catchAsync(async (req, res, next) => {
  // Get user email from request body
  const { email } = req.body;
  // console.log(email);

  const user = await User.findOne({ email });

  if (!user) return next(new AppError('There is no user with this email', 404));

  // Generate a token for password reset
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Create a reset url
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: \n\n ${resetURL}.\n\n
  If you did not forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending the email. Try again later', 500)
    );
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on the token
  const { token } = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  // console.log(hashedToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // if token has not expired and user exists then set the new password
  if (!user) next(new AppError('Token is invalid or has expired'));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  createSendToken(user, 200, res);
});


const updatePassword = catchAsync(async (req, res, next) => {
  //Get user from collection
  const {  currentPassword, newPassword } = req.body;
  // const user = await User.findOne({email}).select('+password');
  const user = await User.findById(req.user.id).select('+password');

  // Check if posted password and confirm password match
  if(!await user.correctPassword(currentPassword, user.password)) next(new AppError('Incorrect current password', 401));

  // If so, update password
  user.password = newPassword;
  user.passwordConfirm = newPassword;
  await user.save();

 createSendToken(user, 200, res);

})


module.exports = {
  checkId,
  checkBody,
  aliasTopTours,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword
};

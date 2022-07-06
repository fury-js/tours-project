/* eslint-disable prettier/prettier */
const jwt = require('jsonwebtoken');
const catchAsync = require('./catchAsync');


const signJWT = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
});



const createSendToken = catchAsync(async (user, statusCode, res) => {
  const token = signJWT(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if(process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.cookie('jwt', token, cookieOptions);
  // console.log("token", token);


  // Remove password from output
  user.password = undefined;
  
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
});

module.exports = createSendToken;
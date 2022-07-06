/* eslint-disable prettier/prettier */
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Tour = require('../models/tourModel');

const getOverview = catchAsync(async (req, res) => {

  const tours = await Tour.find();
  
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

const getTour = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  console.log(slug);

  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if(!tour) {
    return next(new AppError('No tour found with that name', 404));
  }
  



  res.status(200).render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
});

const getLoginForm =  (req, res) => {


  res.status(200).render('login', {
    title: 'Log into your account',
  });
}

const getAccount = (req, res) => {
  
    res.status(200).render('account', {
      title: 'Your account',
    });
}



module.exports = {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
};
/* eslint-disable prettier/prettier */
const Review = require('../models/reviewModel');
// const catchAsync = require('../utils/catchAsync');
const {  deleteOne, updateOne, createOne, getOne, getAll } = require('./handlerFactory');

// const ApiFeatures = require('../utils/apifeatures');
// const AppError = require('../utils/appError');



const setTourUserIds = (req, res, next) => {
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    next();
}

const getAllReviews = getAll(Review)
const createReview = createOne(Review);
const deleteReview = deleteOne(Review);
const updateReview = updateOne(Review);
const getReview = getOne(Review)



module.exports = {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
};
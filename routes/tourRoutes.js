/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

const express = require('express');

const reviewRouter = require('./reviewRoutes');

const {
  getAllTours,
  getOneTour,
  createTour,
  updateTour,
  deleteTour,
  getTourStats,
  getTourMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages,
} = require('../controllers/tourControllers');
// eslint-disable-next-line no-unused-vars
const {
  checkId,
  checkBody,
  aliasTopTours,
  protect,
  restrictTo
} = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// router.param('id', checkId);

// Route handlers

// Routes
// @dev, you can chain the checkBody middleware to the createTour handler

// alias route
router.route('/top-3-tours').get(protect, aliasTopTours, getAllTours)

router.use('/:tourId/reviews', reviewRouter);


router.route('/').get(getAllTours).post(protect, restrictTo("admin"), createTour);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getTourMonthlyPlan)
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/:id')
  .get(getOneTour)
  .patch(
    protect, 
    restrictTo('admin', 'lead-guide'), 
    uploadTourImages, 
    resizeTourImages, 
    updateTour
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;

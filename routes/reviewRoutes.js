/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

const express = require('express');

const { protect, restrictTo } = require('../controllers/authController');
const { getAllReviews, createReview, updateReview, deleteReview, setTourUserIds, getReview } = require('../controllers/reviewController')

const router = express.Router({ mergeParams: true });

router.use(protect)


router.route('/')
.get(getAllReviews)
.post( setTourUserIds, createReview);

router
  .route('/:id')
  .patch(restrictTo('user'), updateReview)
  .get(getReview)
  .delete(restrictTo('user'), deleteReview);
// protect, restrictTo('user'),

module.exports = router;
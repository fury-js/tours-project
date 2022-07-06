/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      trim: true,
      required: [true, 'Please enter a review'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a User'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId}
    },

    {
      $group: {
        _id: 'tour',
        nRatings: { $sum: 1},
        avgRating: { $avg: 'rating'}
      }
    }
  ]);

  // console.log(stats)
  if(stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRatings
    });

  } else {
      await Tour.findByIdAndUpdate(tourId, {
        ratingsAverage: 0,
        ratingsQuantity: 0,
      });
  }

}

reviewSchema.post('save', function() {

  // 'this' points to the current review & 'constructor' points to the model
  this.constructor.calcAverageRatings(this.tour)
  // Review.calcAverageRatings(this.tour)

})

reviewSchema.index({ tour: 1, user: 1}, { unique: true });

reviewSchema.pre(/^findOneAnd/, async function (next) {
  // we execute the findOne method on the query object and save the result to a variable
  this.review = await this.findOne();
  console.log(this.review)
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
 
  this.review.constructor.calcAverageRatings(this.review.tour)
  
});

reviewSchema.pre(/^find/, function (next) {
//   // this.populate({
//   //     path: 'user',
//   //     select: '-__v'
//   // }).populate({
//   //     path: 'tour',
//   //     select: '-__v -description -summary -startDates -startLocation -locations -guides'
//   // })

//   // next()
//   // must call next() to continue execution

  this.populate({
    path: 'user',
    select: '-__v',
  })

  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

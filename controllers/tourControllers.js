/* eslint-disable prettier/prettier */
/* eslint-disable radix */
const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const {
  createOne,
  deleteOne,
  updateOne,
  getOne,
  getAll,
} = require('./handlerFactory');


const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// upload.singe() req.file
// upload.array([]) req.files
// upload.array({}) req.files


const uploadTourImages = upload.fields([
  {name: "imageCover", maxCount: 1},
  {name: 'images', maxCount: 3}
])

const resizeTourImages = catchAsync(async (req, res, next) => {
  // console.log(req.files)

  if (!req.files.imageCover || !req.files.images) return next();

  req.body.imageCover = `tour--${req.params.id}--${Date.now()}--cover.jpeg`;
  console.log(req.body.imageCover)

  // process cover image
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour--${req.params.id}--${Date.now()}--${i + 1}.jpeg`;
      // console.log(file)

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );


  next();
})

const getAllTours = getAll(Tour);
const getOneTour = getOne(Tour, { path: 'reviews' });
const createTour = createOne(Tour);
const updateTour = updateOne(Tour);
const deleteTour = deleteOne(Tour);


// const getAllTours = catchAsync(async (req, res, next) => {
//   res.status(200).json({
//     status: 'success'
//   })
// })

const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  if (!lat || !lng)
    next(new AppError('Please provide lat and lng in the format lat,lng', 400));

  // radiant = distance / radius of earth in miles
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  console.log(lat, lng, distance, unit);
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  if (!lat || !lng)
    next(new AppError('Please provide lat and lng in the format lat,lng', 400));

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: unit === 'mi' ? 0.000621371 : 0.001,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      distances,
    },
  });
});

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.7 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },

    // {
    //   $match: { _id: {$ne: 'EASY'}}
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

// get tour stats
const getTourMonthlyPlan = catchAsync(async (req, res, next) => {
  const { year } = req.params;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-30`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numOfTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numOfTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    result: plan.length,
    data: plan,
  });
});

module.exports = {
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
  resizeTourImages
};

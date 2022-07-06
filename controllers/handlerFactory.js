/* eslint-disable prettier/prettier */

const ApiFeatures = require('../utils/apifeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// filter object to only return the fields we want //helper func
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};



const getAll = (Model) =>
  catchAsync(async (req, res, next) => {

    // To allow for nested routes
    let filter;
    if (req.params.tourId) filter = { tour: req.params.tourId };


    // EXECUTE QUERY
    const features = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .limitFields()
      .paginate();
    const docs = await features.query;

    // Response
    res.status(200).json({
      status: 'success',
      reqtest_time: req.requestTime,
      results: docs.length,
      data: {
        docs,
      },
    });
  });

const createOne = Model => catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    if (!newDoc) {
      return next(
        new AppError(`Error creating document`, 404)
      );
    }

    res.status(201).json({
      status: 'success',
      data: {
        newDoc: newDoc,
      },
    });
  }
  );

// for admin only
const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new AppError(`No document found with id ${req.params.id}`, 404)
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);

const updateDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    // console.log(req.file)
    // console.log(req.body);
    if (req.body.password || req.body.passwordConfirm)
      return next(new AppError('This route is not for password updates', 400));

    const filteredBody = filterObj(
      req.body,
      'name',
      'email',
      'review',
      'rating'
    );
    if(req.file) {
      filteredBody.photo = req.file.filename
    }

    const doc = await Model.findByIdAndUpdate(req.user.id, filteredBody,  {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        doc: doc,
      },
    });
  }
);

const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
  
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if(!doc) return next(new AppError(`No document found with id ${req.params.id}`, 404));

    res.status(200).json({
      status: 'success',
      data: {
        doc: doc,
      },
    });
  });

const getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      return next(new AppError(`No document found with id ${req.params.id}`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  }
);

module.exports = {
  getAll,
  createOne,
  deleteOne,
  getOne,
  updateDoc,
  updateOne
};

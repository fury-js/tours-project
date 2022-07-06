/* eslint-disable prettier/prettier */
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { createOne, deleteOne, updateDoc, updateOne, getOne, getAll } = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users/images');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`); // user-id-timestamp.ext
//   }
// })

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
}

const upload = multer({ 
  storage: multerStorage,
  fileFilter: multerFilter
});



// users
const getAllUsers = getAll(User);
const createUser = createOne(User);
const getUser = getOne(User);
const updateMe = updateDoc(User);

// for admins only
const deleteUser = deleteOne(User);


const uploadImage = upload.single('photo')

const resizeImage = catchAsync(async (req, res, next) => {
  if(!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({quality: 90})
    .toFile(`public/img/users/${req.file.filename}`)

  next();

})



// for admin
const updateUser = updateOne(User);

const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
}




const deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });

  if(!user) return next(new AppError('No user found with this id', 404));

  res.status(204).json({
    status: 'success',
    data: null
  })
})



module.exports = {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    updateMe,
    deleteUser,
    deleteMe,
    getMe,
    uploadImage,
    resizeImage
}
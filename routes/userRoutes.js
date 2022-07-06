/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

const express = require('express');



const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  updateMe,
  deleteUser,
  deleteMe,
  getMe,
  uploadImage,
  resizeImage
} = require('../controllers/userControllers');


const {
  signUp,
  signIn,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword,
  restrictTo,
  logOut,
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', signIn);
router.get('/logout', logOut)




router.post('/forgotPassword', forgotPassword);


// Protect all routes after this middleware
router.use(protect)

router.patch('/resetPassword/:token',resetPassword);
router.patch('/updateMyPassword',updatePassword);
router.patch('/updateMe', uploadImage, resizeImage, updateMe);
router.route('/me').get( getMe, getUser)

router.delete('/deleteMe',deleteMe);


router.use(restrictTo('admin'));

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);



module.exports = router;

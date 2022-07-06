/* eslint-disable prettier/prettier */
const express = require('express');

const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount
  
} = require('../controllers/viewsController');

const { protect, isLoggedIn } = require('../controllers/authController');

const router = express.Router();



// client-side data
// router.get('/', (req, res) => {
//   res.status(200).render('base', {
//     user: "Chukky"
//   })
// })

// router.use((req, res, next) => {
//   res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
//   next();
// });

// router.use(isLoggedIn)

router.get('/', isLoggedIn, getOverview);
router.get('/login', isLoggedIn, getLoginForm);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/me', protect,  getAccount);




module.exports = router;
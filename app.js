/* eslint-disable prettier/prettier */
/* eslint-disable node/no-extraneous-require */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line import/no-extraneous-dependencies

// eslint-disable-next-line import/no-extraneous-dependencies
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const express = require('express');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// // Routers
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();
app.use(cors());
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


// global middlewares
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// header security
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// dev logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// rate limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(compression());

app.use((req, res, next) => {
  // console.log('req.cookies', req.cookies);
  next();
});

app.use('/', viewRouter);


// // Api Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.use('/api/v1/reviews', reviewRouter);

// Global  Error handling middleware for all routes
app.all('*', (req, res, next) => {
  // this will skip all the middlewares and go to the error handling middleware
  next(
    new AppError(
      `Page not found, please check the ${req.originalUrl} and try again.`,
      404
    )
  );
});
// Global  Error handling middleware for all app errors
app.use(globalErrorHandler);

module.exports = app;

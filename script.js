/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
const { readFileSync } = require('fs');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./models/tourModel');
const User = require('./models/userModel');
const Review = require('./models/reviewModel');

dotenv.config({
  path: './config.env',
});

const DB = process.env.DATABASE.replace(
  'PASSWORD',
  process.env.DATABASE_PASSWORD
);

//   Read Json file
const tours = JSON.parse(readFileSync(
  `${__dirname}/dev-data/data/tours.json`,
  'utf-8'
))

const users = JSON.parse(
  readFileSync(`${__dirname}/dev-data/data/users.json`, 'utf-8')
);

const reviews = JSON.parse(
  readFileSync(`${__dirname}/dev-data/data/reviews.json`, 'utf-8')
);




mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((result) => console.log('DB Connection was successful'))
  .catch((err) => console.log('failed to connect to db', err))

// console.log(process.env.NODE_ENV);




// import data into db
const importData = async () => {
    try {
      await Tour.create(tours)
      await User.create(users, {validateBeforeSave: false})
      await Review.create(reviews);
      
      console.log("Data Successfully loaded");
      
      
    } catch (error) {
      console.log("Failed to import data into database", error)
      
    }
    process.exit();
}





// Delete all data from db
const deleteData = async () =>  {
  try {
    const deletedTours = await Tour.deleteMany();
    const deletedUsers = await User.deleteMany();
    const deletedReviews = await Review.deleteMany();


    if (deletedTours && deletedUsers && deletedReviews) {
      console.log('Data Successfully deleted');
    }
  } catch (error) {
    console.log('Failed to delete data into database', error);
  }
  process.exit();
}










if(process.argv[2] === '--import') {
  importData();
  bcrypt
    .compare(
      'test1234',
      '$2b$12$iYOo2wf7MisID9WOh0aEt.dFh64oDIJKD5fp/g3uke/PJFEGK7WGW'
      // '$2b$12$iYOo2wf7MisID9WOh0aEt.dFh64oDIJKD5fp/g3uke/PJFEGK7WGW'
    )
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });
  console.log()
      
  
} else if (process.argv[2] === '--delete') {
  deleteData()
}






/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Uncaught exception error handling
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION: Shutting down...');
  console.log(err.name, err.message);

  process.exit(1);
});



dotenv.config({
  path: './config.env',
});

const app = require('./app');


const DB = process.env.DATABASE.replace(
  'PASSWORD',
  process.env.DATABASE_PASSWORD
);


mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((result) => console.log('DB Connection was successful'))
  .catch((err) => console.log(err));

console.log(process.env.NODE_ENV);



// Start the server
const port = 3000 ;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled promise rejection: Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
  
})



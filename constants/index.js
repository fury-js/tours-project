const { readFile, readFileSync, writeFile } = require('fs');

const tours = JSON.parse(
  readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

module.exports = tours;

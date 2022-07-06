/* eslint-disable prettier/prettier */
/* eslint-disable radix */
/* eslint-disable no-unused-vars */
class APIfeatures {
  constructor(query, queryObject) {
    this.query = query;
    this.queryObject = queryObject;
  }

  filter() {
    const queryObj = { ...this.queryObject };

    const excludedFields = ['page', 'fields', 'sort', 'limit'];
    excludedFields.forEach((el) => {
      delete queryObj[el];
    });

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryObject.sort) {
      const sortBy = this.queryObject.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryObject.fields) {
      const fields = this.queryObject.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    if (this.queryObject.page) {
      // const numOfTours = await Tour.countDocuments();
      const page = parseInt(this.queryObject.page) || 1;
      const limit = parseInt(this.queryObject.limit) || 100;
      const skipValue = (page - 1) * limit;
      // if (skipValue >= numOfTours) throw new Error('this page does not exist');
      this.query = this.query.skip(skipValue).limit(limit);
    }

    return this;
  }
}

module.exports = APIfeatures;

import { ExcludedFields } from '../constants/params';

export default class APIFeatures {
  constructor(
    public query: any,
    public queryParams: any,
  ) {
    this.query = query;
    this.queryParams = queryParams;
  }

  filter() {
    //Example: localhost:3000/api/v1/tours?difficulty=easy&duration[gte]=5&page=1&price[lt]=1500
    const queryObj = { ...this.queryParams };
    ExcludedFields.forEach((excludedParam) => delete queryObj[excludedParam]);

    //replace gte into $gte for Mongo usage
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // localhost:3000/api/v1/tours?sort=price //ascending
  // localhost:3000/api/v1/tours?sort=price,ratingsAverage //ascending
  // localhost:3000/api/v1/tours?sort=-price //descending
  sort() {
    if (this.queryParams.sort) {
      const sortBy = (this.queryParams.sort as string).split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      //default sorting
      this.query = this.query.sort('-createdAt name');
    }
    return this;
  }

  // localhost:3000/api/v1/tours?fields=name,duration,difficulty
  limitFields() {
    if (this.queryParams.fields) {
      const fields = (this.queryParams.fields as string).split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      //default projection, since `__v` is in Mongo DB Document by default. We will exclude __v by default
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 100;
    const skip = (page - 1) * limit;
    console.log({ page, limit, skip });
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

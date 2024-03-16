import { ITour, Tour } from '../models/tourModel';
import { ApiRequest } from '../app';
import { Request, Response } from 'express';
import { ExcludedFields } from '../constants/params';

export const getTour = async (req: Request, res: Response) => {
  try {
    const tour = (await Tour.findById(req.params.id)) as ITour;
    //const tour = await Tour.findOne({ _id: req.params.id }); //equivalent to above
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
};

export const updateTour = async (req: Request, res: Response) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      //upsert: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

export const deleteTour = async (req: Request, res: Response) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

export const createTour = async (req: Request, res: Response) => {
  // const newTour = new Tour({});
  // newTour.save();
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};

export const getAllTours = async (req: ApiRequest, res: Response) => {
  try {
    // console.log(req.query);
    let queryStr = JSON.stringify(req.query);

    // 1. Filtering

    //replace gte into $gte for Mongo usage
    //\b is a word boundary or matching the exact word, /g is repetitive
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    //console.log(`Adjusted query: ${queryStr}`);

    //later on we will have some parameters, which does not belong to ITour
    //Example: localhost:3000/api/v1/tours?difficulty=easy&duration[gte]=5&page=1&price[lt]=1500
    const queryObj = JSON.parse(queryStr);
    ExcludedFields.forEach((excludedParam) => delete queryObj[excludedParam]);
    let query = Tour.find(queryObj);

    // 2.Sorting
    // localhost:3000/api/v1/tours?sort=price //ascending
    // localhost:3000/api/v1/tours?sort=price,ratingsAverage //ascending
    // localhost:3000/api/v1/tours?sort=-price //descending
    if (req.query.sort) {
      const sortBy = (req.query.sort as string).split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      //default sorting
      query = query.sort('-createdAt name');
    }

    // 3. Fields Projection
    // localhost:3000/api/v1/tours?fields=name,duration,difficulty
    if (req.query.fields) {
      const fields = (req.query.fields as string).split(',').join(' ');
      query = query.select(fields);
    } else {
      //default projection, since `__v` is in Mongo DB Document by default. We will exclude __v by default
      query = query.select('-__v');
    }

    // 4. Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    console.log({ page, limit, skip });
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) {
        throw new Error('This page does not exist');
      }
    }

    // 5. Executing query
    //query.skip().limit().select().sort().exec()
    const tours = (await query) as ITour[];

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

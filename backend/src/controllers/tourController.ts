/* eslint-disable @typescript-eslint/no-unused-vars */
import { catchAsync } from '../utils/catchAsync';
import { ApiRequest } from '../app';
import { ITour, Tour } from '../models/tourModel';
import APIFeatures from '../utils/apiFeatures';
import { NextFunction, Request, Response } from 'express';
import AppError from '../utils/appError';

export const getTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tour = (await Tour.findById(req.params.id)) as ITour;
    //const tour = await Tour.findOne({ _id: req.params.id }); //equivalent to above

    if (!tour) {
      return next(new AppError('No tour found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  },
);

export const updateTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      //upsert: true,
    });

    if (!tour) {
      return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  },
);

export const deleteTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
      return next(new AppError('No tour found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  },
);

export const createTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const newTour = new Tour({});
    // newTour.save();
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  },
);

export const getAllTours = catchAsync(
  async (req: ApiRequest, res: Response, next: NextFunction) => {
    // console.log(req.query);
    //query.skip().limit().select().sort().exec()
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = (await features.query) as ITour[];

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  },
);

export const aliasTopTours = catchAsync(
  async (req: Request, _: Response, next: NextFunction) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
  },
);

export const getTourStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRatings: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          numTours: { $sum: 1 },
        },
      },
      {
        $sort: { avgPrice: 1 }, //sort bu avgPrice in ascending order
      },
      // {
      //   $match: { _id: { $ne: 'EASY' } },
      // },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  },
);

export const getMonthlyPlan = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const year = Number(req.params.year);
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' }, //id the document by month
      },
      {
        $project: {
          _id: 0, //0 means don't return _id
        },
      },
      {
        $sort: { numTourStarts: -1 }, //descending
      },
      {
        $limit: 12, // 12 months
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  },
);

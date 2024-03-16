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

    //later on we will have some parameters, which does not belong to ITour
    //Example: localhost:3000/api/v1/tours?page=5&difficulty=easy
    //We will have to exclude page from database query
    const queryObj = { ...req.query };
    ExcludedFields.forEach((excludedParam) => delete queryObj[excludedParam]);

    //Option1: Using MongoDB query filter
    //localhost:3000/api/v1/tours?duration=5&difficulty=easy
    const query = Tour.find(queryObj);
    const tours = (await query) as ITour[];

    //Option2: Using mongoose query filter
    // const query = Tour.find()
    //   .where('duration')
    //   .equals(req.query.duration)
    //   .where('difficulty')
    //   .equals(req.query.difficulty);

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

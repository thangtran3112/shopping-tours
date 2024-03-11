import { ApiRequest } from '../app';
import { NextFunction, Request, Response } from 'express';
import { readFileSync, writeFile } from 'fs';
import { join } from 'path';
const tourPath = join(__dirname, '../dev-data/data/tours-simple.json');

export const tours = JSON.parse(readFileSync(tourPath, 'utf8')) as any[];

export const checkPostBody = (
  req: Request,
  res: Response,
  next: NextFunction,
): any => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
};

export const checkID = (
  req: Request,
  res: Response,
  next: NextFunction,
  val: any,
): any | undefined => {
  if (val > tours.length) {
    return res.status(404).json({
      status: 'fail',
      data: {
        tour: `Invalid Id: ${val}`,
      },
    });
  }
  next();
};

export const getTour = (req: Request, res: Response): any => {
  const id = parseInt(req.params.id); //convert to int
  const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

export const updateTour = (req: Request, res: Response): any => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};

export const deleteTour = (req: Request, res: Response): any => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

export const createTour = (req: Request, res: Response) => {
  // console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    () => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    },
  );
};

export const getAllTours = (req: ApiRequest, res: Response) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

import express, { Express, NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import { readFileSync, writeFile } from 'fs';
import morgan, { Morgan } from 'morgan';

interface ApiRequest extends Request {
  requestTime?: string;
}

dotenv.config();

const app: Express = express();

// 1) MIDDLEWARES
//chaining your requests through middleware, before sending the response
app.use(morgan('dev'));
app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('Hello from the middleware 😂');
  next();
});
app.use((req: ApiRequest, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) FUNCTIONS
const tours = JSON.parse(
  readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf8'),
) as any[];

const getTour = (req: Request, res: Response): any => {
  console.log(req.params);
  const id = parseInt(req.params.id); //convert to int
  const tour = tours.find((el) => el.id === id);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      reason: `Unable to find tour with id of ${id}`,
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const updateTour = (req: Request, res: Response): any => {
  const id = parseInt(req.params.id); //convert to int
  if (id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      data: {
        tour: 'Invalid Id',
      },
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};

const deleteTour = (req: Request, res: Response): any => {
  const id = parseInt(req.params.id); //convert to int
  if (id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      data: {
        tour: 'Invalid Id',
      },
    });
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

const postTour = (req: Request, res: Response) => {
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

const getAllTours = (req: ApiRequest, res: Response) => {
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

const getAllUsers = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
const createUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
const getUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
const updateUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
const deleteUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

// 3) ROUTES
const tourRouter = express.Router();
const userRouter = express.Router();

tourRouter.route('/').get(getAllTours).post(postTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// 3) START SERVER
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(
    `App is running on ${port}, for local access: http://localhost:${port}`,
  );
});

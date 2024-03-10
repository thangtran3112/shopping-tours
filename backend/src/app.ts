import express, { Express, NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import { readFileSync, writeFile } from 'fs';

dotenv.config();

const app: Express = express();

interface ApiRequest extends Request {
  requestTime?: string;
}

//chaining your requests through middleware, before sending the response
app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('Hello from the middleware 😂');
  next();
});
app.use((req: ApiRequest, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  next();
});

const port = process.env.PORT || 3000;

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

const patchTour = (req: Request, res: Response): any => {
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

app.route('/api/v1/tours').get(getAllTours).post(postTour);
app.route('/api/v1/tours/:id').get(getTour).patch(patchTour).delete(deleteTour);

app.listen(port, () => {
  console.log(
    `App is running on ${port}, for local access: http://localhost:${port}`,
  );
});

import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { readFileSync, writeFile } from 'fs';

dotenv.config();

const app: Express = express();
//express middleware for inspecting requests. Body is added to request object
app.use(express.json());
const port = process.env.PORT || 3000;

const tours = JSON.parse(
  readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf8'),
) as any[];

app.get('/api/v1/tours', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

//localhost:3000/api/v1/tours/5/2/3
//add ? to make a Path parameter optional '/api/v1/tours/:id/:x/:y?'
app.get('/api/v1/tours/:id', (req: Request, res: Response): any => {
  console.log(req.params);
  const id = parseInt(req.params.id); //convert to int
  const tour = tours.find((el) => el.id === id);

  if (!tour) {
    return res.status(404).json({
      status: 'Fail',
      reason: `Unable to find tour with id of ${id}`,
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

app.post('/api/v1/tours', (req: Request, res: Response) => {
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
});

app.listen(port, () => {
  console.log(
    `App is running on ${port}, for local access: http://localhost:${port}`,
  );
});

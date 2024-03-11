import express, { Express, NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import tourRouter from './routes/tourRoutes';
import userRouter from './routes/userRoutes';

export interface ApiRequest extends Request {
  requestTime?: string;
}

const app: Express = express();

// 1) MIDDLEWARES
//chaining your requests through middleware, before sending the response
app.use(morgan('dev'));
app.use(express.json());
app.use((req: ApiRequest, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

export default app;

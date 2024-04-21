import express, { Express, NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import tourRouter from './routes/tourRoutes';
import userRouter from './routes/userRoutes';
import { join } from 'path';
import AppError from './utils/appError';
import { globalErrorHandler } from './controllers/errorController';

export interface ApiRequest extends Request {
  requestTime?: string;
}

const app: Express = express();

// 1) MIDDLEWARES
//chaining your requests through middleware, before sending the response

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(join(__dirname, '/public')));

app.use((req: ApiRequest, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers);
  next();
});

// 2) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

/** If a request comes here, it was not handled by any previous routers */
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server`) as any;
  // err.statusCode = 404;
  // err.status = 'fail';

  //whatever you pass in next, it will be considered as an error, and skip other middlewares
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;

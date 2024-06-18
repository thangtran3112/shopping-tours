import express, { Express, NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { xss } = require('express-xss-sanitizer');

import tourRouter from './routes/tourRoutes';
import userRouter from './routes/userRoutes';
import { join } from 'path';
import AppError from './utils/appError';
import { globalErrorHandler } from './controllers/errorController';

export interface ApiRequest extends Request {
  requestTime?: string;
}

const app: Express = express();

// 1) GLOBAL MIDDLEWARES

// Set Security HTTP headers, should always be the first middleware
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//100 requests per hour for one IP address
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!',
});
//limiter only applies to this api route
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); //limit the request body to 10kb

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

//Prevent parameter pollution, such as duplicate query parameters
//Eg: ?sort=price&sort=name
//we still want to allow some exceptions, like ?duration=5&duration=10
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// Serving static files
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

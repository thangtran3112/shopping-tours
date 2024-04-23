/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import User, { IUser } from '../models/userModel';
import { catchAsync } from '../utils/catchAsync';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError';
import { Types } from 'mongoose';
import { AppRequest } from '../utils/types';
import { sendEmail } from '../utils/email';

export const signToken = (id: Types.ObjectId) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN!,
  });
};

export const signup = catchAsync(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    //for security purpose, we will not pass the whole res.body to User.create
    //but only the necessary fields. This would avoid hackers to add bogus fields to the database
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
      role: req.body.role,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  },
);

export const login = catchAsync(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    //because we set password.select = false in model, normal query will not return password field
    const user = (await User.findOne({ email }).select('+password')) as IUser;

    //compare request password with hashed password in database
    if (!user || !(await user?.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      token,
    });
  },
);

export const protect = catchAsync(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    // 1) Getting token and check of it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError(
          'You are not logged in! Please log in to get access.',
          401,
        ),
      );
    }

    // 2) Verification token
    const promise = new Promise((resolve, _) =>
      resolve(jwt.verify(token, process.env.JWT_SECRET!)),
    );
    const decoded = (await promise) as jwt.JwtPayload;

    // 3) Check if user still exists, in case token was correct, but user was deleted
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401,
        ),
      );
    }

    // 4) Check if user changed password after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat!)) {
      return next(
        new AppError(
          'User recently changed password! Please log in again.',
          401,
        ),
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    //(req as any).user = freshUser;
    req.user = freshUser;

    next(); // do not use "return next()" unless we want to stop propagation to other middlewares
  },
);

export const restrictTo = (...roles: string[]) => {
  return (req: AppRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user!.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }
    next();
  };
};

export const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('There is no user with email address.', 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    //bypass all model validators and save the user
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message =
      `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\n` +
      `If you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message,
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email',
      });
    } catch (err) {
      console.log(err);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          'There was an error sending the email. Try again later!',
          500,
        ),
      );
    }
  },
);

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {},
);

/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import User, { IUser } from '../models/userModel';
import { catchAsync } from '../utils/catchAsync';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError';
import { Types } from 'mongoose';

export const signToken = (id: Types.ObjectId) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN!,
  });
};

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
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
  async (req: Request, res: Response, next: NextFunction) => {
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

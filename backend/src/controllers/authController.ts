/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import User, { IUser } from '../models/userModel';
import { catchAsync } from '../utils/catchAsync';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError';
import { Types } from 'mongoose';
import { AppRequest } from '../utils/types';
import { sendEmail } from '../utils/email';
import { createHash } from 'crypto';

export const signToken = (id: Types.ObjectId) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN!,
  });
};

export const createSendToken = (
  user: IUser,
  statusCode: number,
  res: Response,
) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

interface SignupBody {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role: string;
  passwordChangedAt: Date; //injected by Mongoose middleware
}

export const signup = catchAsync(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    const { name, email, password, passwordConfirm, role, passwordChangedAt } =
      req.body as SignupBody;

    //for security purpose, we will not pass the whole res.body to User.create
    //but only the necessary fields. This would avoid hackers to add bogus fields to the database
    const newUser = await User.create({
      name,
      email,
      password,
      passwordConfirm,
      passwordChangedAt,
      role,
    });

    createSendToken(newUser, 201, res);
  },
);

interface LoginBody {
  email: string;
  password: string;
}

export const login = catchAsync(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    const { email, password } = req.body as LoginBody;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    //because we set password.select = false in model, normal query will not return password field
    const user = (await User.findOne({ email }).select('+password')) as IUser;

    //compare request password with hashed password in database
    if (!user || !(await user?.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(user, 200, res);
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

interface ForgotPasswordBody {
  email: string;
}

export const forgotPassword = catchAsync(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    const { email } = req.body as ForgotPasswordBody;

    // 1) Get user based on POSTed email
    const user = await User.findOne({
      email,
    });
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
        message: 'Token sent to email!',
      });
    } catch (err) {
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

interface ResetPasswordBody {
  password: string;
  passwordConfirm: string;
}

export const resetPassword = catchAsync(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    // 1) Get user based on the token
    const hashedToken = createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }
    const { password, passwordConfirm } = req.body as ResetPasswordBody;
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user, directly through model
    // done with moongoose pre-save middleware

    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
  },
);

interface UpdatePasswordBody {
  passwordCurrent: string;
  password: string;
  passwordConfirm: string;
}

export const updatePassword = catchAsync(
  async (req: AppRequest, res: Response, next: NextFunction) => {
    const authedUser = req.user!;
    const { passwordCurrent, password, passwordConfirm } =
      req.body as UpdatePasswordBody;

    // 1) Get user from collection
    const user = await User.findById(authedUser._id).select('+password');
    if (!user) {
      return next(new AppError('User not found in database', 404));
    }

    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(passwordCurrent, user.password))) {
      return next(new AppError('Your current password is wrong.', 401));
    }

    // 3) If so, update password
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();
    // User.findByIdAndUpdate will NOT work here because of pre-save middlewares

    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
  },
);

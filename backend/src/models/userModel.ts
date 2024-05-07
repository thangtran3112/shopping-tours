import { compare, hash } from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import mongoose, {
  CallbackWithoutResultAndOptionalError,
  Types,
} from 'mongoose';
import validator from 'validator';

export interface IUser {
  correctPassword(password: any, password1: string): unknown;
  changedPasswordAfter(JWTTimestamp: number): unknown;
  createPasswordResetToken(): unknown;
  _id: Types.ObjectId;
  name: string;
  email: string;
  photo?: string;
  role: string;
  password: string;
  passwordConfirm: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  active: boolean;
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true, //transform to lowercase
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on Mongoose CREATE or SAVE!!!
      //Mongoose does not keep object in memory, this will not work on UPDATE
      validator: function (this: any, el: string) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

//pre-save Mongoose middleware, this will be refered to mongoose userSchema collection
//Mongoose does not keep object in memory, so this pre-save will not work on UPDATE
userSchema.pre(
  'save',
  async function (this: any, next: CallbackWithoutResultAndOptionalError) {
    //Only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    //Hash the password with cost of 12, async version of hashing
    this.password = await hash(this.password, 12);

    //Delete passwordConfirm field, as it is only required for input, not on saving
    this.passwordConfirm = undefined;
    next();
  },
);

//Mongoose does not keep object in memory, so this pre-save will not work on UPDATE
userSchema.pre(
  'save',
  function (this: any, next: CallbackWithoutResultAndOptionalError) {
    //if password is not modified, or this is a new document, skip to the next middleware
    if (!this.isModified('password') || this.isNew) return next();

    //sometime saving property to db take a while, and we want the responsed
    //JWT token to have higher timestamp than passwordChangedAt
    this.passwordChangedAt = Date.now() - 1000;
    next();
  },
);

//query middleware for any query that starts with find regular expresion
userSchema.pre(/^find/, function (this: any, next) {
  //this would add this find query to be run before the actual query
  this.find({ active: { $ne: false } });
  next();
});

//mongoose instance methods, cannot convert to arrow function, as we need to refer this to userSchema
userSchema.methods.correctPassword = function (
  candidatePassword: string,
  userPassword: string,
) {
  return compare(candidatePassword, userPassword);
};

//document instance method
userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
    //console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }

  //False means password was not changed
  return false;
};

/**
 * Reset token does not need high security as password encryption
 * As it is short live and to be available for 10 minutes only
 */
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = randomBytes(32).toString('hex');
  this.passwordResetToken = createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes for reset token
  return resetToken; //send back the unencrypted reset token to email
};

const User = mongoose.model('User', userSchema);
export default User;

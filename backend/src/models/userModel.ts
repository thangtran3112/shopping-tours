import { compare, hash } from 'bcrypt';
import mongoose, {
  CallbackWithoutResultAndOptionalError,
  Types,
} from 'mongoose';
import validator from 'validator';

export interface IUser {
  correctPassword(password: any, password1: string): unknown;
  changedPasswordAfter(JWTTimestamp: number): unknown;
  _id: Types.ObjectId;
  name: string;
  email: string;
  photo?: string;
  role: string;
  password: string;
  passwordConfirm: string;
  passwordChangedAt?: Date;
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
      validator: function (this: any, el: string) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
});

//pre-save Mongoose middleware, this will be refered to mongoose userSchema collection
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

//mongoose instance methods, cannot convert to arrow function, as we need to refer this to userSchema
userSchema.methods.correctPassword = function (
  candidatePassword: string,
  userPassword: string,
) {
  return compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
    //console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }

  //False means password was not changed
  return false;
};

const User = mongoose.model('User', userSchema);
export default User;

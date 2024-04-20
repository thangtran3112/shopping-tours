import { hash } from 'bcrypt';
import mongoose, { CallbackWithoutResultAndOptionalError } from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema({
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
});

//pre-save Mongoose middleware
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

const User = mongoose.model('User', userSchema);
export default User;

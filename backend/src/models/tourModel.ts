/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose, { Query } from 'mongoose';
import slugify from 'slugify';
import validator from 'validator';

export enum Difficulty {
  easy = 'easy',
  medium = 'medium',
  difficult = 'difficult',
}

export interface ITour {
  name: string;
  price: number;
  duration: number;
  maxGroupSize: number;
  difficulty: Difficulty;
  ratingsAverage?: number;
  ratingQuantity?: number;
  priceDiscount?: number;
  summary: string;
  description?: string;
  imageCover: string;
  images?: string[];
  createdAt?: Date | string; //Mongoose will convert it to Date
  startDates?: Date[] | string[]; //Mongoose will convert it to Date
  slug?: string;
  secretTour?: boolean;
}

//mutation must have 'runValidation: true' to allow validating each field
const tourSchema = new mongoose.Schema<ITour>(
  {
    name: {
      type: String, //native Js types
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: Object.values(Difficulty),
        message: `Difficulty must be either: ${Object.values(Difficulty)}`,
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: {
      type: Number,
      validate: {
        //custom validator
        validator: function (this: ITour, value: number) {
          // this only points to current doc on NEW document creation, not for updating exist document
          return value < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    //if input is a string, it will be converted to Date
    createdAt: {
      type: Date,
      default: Date.now(),
      // select: false, //exclude this field from Database response projection
    },
    //if input is a string array, it will be converted to Date array
    startDates: [Date],
    slug: {
      type: String,
      trim: true,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    //each time the schema is converted to JSON, virtual properties will be added
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//virtual property, which is available on the document but not in the database
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//mongoose middleware function
//run before .save() and .create(), but not .findOne() or insertMany()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre('save', function (next) {
  console.log('Will save document...');
  next();
});

//execute after all other mongoose middlewares finish
tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});

//query middleware before the query is executed, with regex matching
// for find(), findOne(), findOneAndUpdate(), findOneAndDelete()
tourSchema.pre(/^find/, function (this: any, next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

//After the query is executed
tourSchema.post(/^find/, function (this: any, docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  //console.log(this.pipeline());
  //unshift adds to the beginning if the array of pipeline stages
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  //console.log(this.pipeline());
  next();
});

//model is uppercase
export const Tour = mongoose.model('Tour', tourSchema);

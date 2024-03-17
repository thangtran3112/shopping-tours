import mongoose from 'mongoose';
import slugify from 'slugify';

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
  discount?: number;
  summary: string;
  description?: string;
  imageCover: string;
  images?: string[];
  createdAt?: Date | string; //Mongoose will convert it to Date
  startDates?: Date[] | string[]; //Mongoose will convert it to Date
  slug?: string;
}

const tourSchema = new mongoose.Schema<ITour>(
  {
    name: {
      type: String, //native Js types
      required: [true, 'A tour must have a name'],
      unique: true,
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
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      validate: {
        validator: function (this: ITour, value: number) {
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

//model is uppercase
export const Tour = mongoose.model('Tour', tourSchema);

import mongoose from 'mongoose';

export interface ITour {
  name: string;
  price: number;
  rating?: number;
}

const tourSchema = new mongoose.Schema<ITour>({
  name: {
    type: String, //native Js types
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  rating: {
    type: Number,
    default: 4.5,
  },
});

//model is uppercase
export const Tour = mongoose.model('Tour', tourSchema);

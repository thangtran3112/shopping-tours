import dotenv from 'dotenv';
import { join } from 'path';
import { readFileSync } from 'fs';
import { Tour } from '../../models/tourModel';
import mongoose from 'mongoose';

dotenv.config({ path: join(__dirname, '../../../config.env') });

mongoose
  .connect(process.env.DB_URL!, {
    autoIndex: true,
    user: process.env.DB_USERNAME!,
    pass: process.env.DB_PASSWORD!,
  })
  .then(() => console.log('DB connection successful!'));

const tours = JSON.parse(
  readFileSync(join(__dirname, '/tours-simple.json'), 'utf-8'),
);

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
};

// npx ts-node src/dev-data/data/import-dev-data.ts --delete
const handleData = async () => {
  if (process.argv.includes('--delete')) {
    await deleteData();
  }
  if (process.argv.includes('--import')) {
    await importData();
  }
  process.exit();
};

handleData();

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { join } from 'path';

//Must load the config before importing app, so app will have process.env ready
dotenv.config({ path: join(__dirname, '../config.env') });
import app from './app';

// 2) CONNECT TO DB
// If using special character in password, must encode the character
// https://stackoverflow.com/questions/7486623/mongodb-password-with-in-it
//const DB_LOCAL = process.env.DB_LOCAL;
mongoose
  .connect(process.env.DB_URL!, {
    autoIndex: true,
    user: process.env.DB_USERNAME!,
    pass: process.env.DB_PASSWORD!,
  })
  .then(() => console.log('DB connection successful!'));

// 3) START SERVER

if (!!!process.env.PORT) {
  console.warn(
    'PORT is not specified in .env file or environement variables. Using default port 3000',
  );
}
console.log(`Running mode ${process.env.NODE_ENV}`);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(
    `App is running on ${port}, for local access: http://localhost:${port}`,
  );
});

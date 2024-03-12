import dotenv from 'dotenv';
import { join } from 'path';

//Must load the config before importing app, so app will have process.env ready
dotenv.config({ path: join(__dirname, '../config.env') });

import app from './app';

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

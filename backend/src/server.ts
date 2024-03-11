import dotenv from 'dotenv';
import app from './app';

// 3) START SERVER
dotenv.config();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(
    `App is running on ${port}, for local access: http://localhost:${port}`,
  );
});

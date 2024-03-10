import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Hello from the srver side!',
    app: 'Natours',
  });
});

app.post('/', (req: Request, res: Response) => {
  res.send('You can post to this URL');
});

app.listen(port, () => {
  console.log(
    `App is running on ${port}, for local access: http://localhost:${port}`,
  );
});

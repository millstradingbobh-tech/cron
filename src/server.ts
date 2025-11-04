import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';

import * as attioSanity from './attio';

const app: Application = express();
let unusedVar;
// Express Middlewares
app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use(express.json());

// Root Route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to Typescript Node.js Server Setup Guide!!!' });
});

// erver Health Check
app.get('/health-check', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is up and running!' });
});

app.get('/attio-sanity', (req: Request, res: Response) => {
  attioSanity.companyDevice();
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

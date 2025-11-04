import dotenv from 'dotenv';
dotenv.config()

import express from "express";
import * as attioSanity from './src/attio';

const app = express();

app.get('/', (req, res) => {
    console.log(process.env)
    res.send('hello, world');
});

app.get('/attio-sanity', async (req, res) => {
    console.log(process.env.SENITY_PROJECT_ID)

  await attioSanity.companyDevice();
  res.send('ok');
});

app.listen(process.env.PORT || 8080);
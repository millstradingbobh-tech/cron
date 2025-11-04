import express from "express";
import * as attioSanity from './src/attio';

const app = express();

app.get('/', (req, res) => {
  res.send('hello, world');
});

app.get('/attio-sanity', async (req, res) => {
  await attioSanity.companyDevice();
  res.send('ok');
});

app.listen(process.env.PORT || 8080);
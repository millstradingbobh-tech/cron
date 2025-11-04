import express from "express";
import * as attioSanity from './src/attio';

const app = express();

app.get('/', (req, res) => {
  res.send('hello, world');
});

app.get('/attio-sanity', () => {
  attioSanity.companyDevice();
});

app.listen(process.env.PORT || 8080);
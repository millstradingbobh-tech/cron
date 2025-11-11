import dotenv from 'dotenv';
dotenv.config()

import express from "express";
import * as attioSanity from './src/attio';
import { customRates } from './src/customRates';
import { createShopifyCheckout } from './src/shopify/createShopifyCheckout';
import { createShopifyOrder } from './src/shopify/createShopifyOrder';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    console.log(process.env)
    res.send('hello, world');
});

app.get('/attio-sanity', async (req, res) => {
    console.log(process.env.SENITY_PROJECT_ID)

  await attioSanity.companyDevice();
  res.send('ok');
});

app.post("/api/shopify/rates", (req, res) => {
    console.log(req.body)
    const { rate } = req.body;
    console.log("📦 Rate request:", JSON.stringify(rate, null, 2));
    const rates = customRates(rate.currency);
    res.json({ rates });
});

app.post("/api/shopify/createOrder", async (req, res) => {
    const order = await createShopifyOrder(req.body);
    res.json({ order });
});

app.post("/api/shopify/createCheckout", async (req, res) => {
    const cart = await createShopifyCheckout(req.body);
    res.json({ cart });
});

app.listen(process.env.PORT || 8080);
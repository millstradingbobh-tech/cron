import dotenv from 'dotenv';
dotenv.config()

import express from "express";
import * as attioSanity from './src/attio';
import { customRates } from './src/customRates';
import { createShopifyCheckout } from './src/shopify/createShopifyCheckout';
import { createShopifyOrder } from './src/shopify/createShopifyOrder';
import { getProducts } from './src/shopify/getShopifyProducts';
import { apiInterceptor } from './src/utils/inteceptor';
import { generateConnectionToken, createPaymentIntent } from './src/tap/stripe';

const app = express();
app.use(express.json());
app.use(apiInterceptor());

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
    const { rate } = req.body;
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

app.get("/api/shopify/getProducts", async (req, res) => {
    const products = await getProducts();
    res.json({ products });
});

app.post('/stripe/tap/connection-token', async (req, res) => {
  try {
    const secret = await generateConnectionToken();
    res.json({ secret });
  } catch (error) {
    console.error('Error generating connection token:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/stripe/tap/create-payment-intent', async (req, res) => {
  try {
    const clientSecret = await createPaymentIntent(req.body);
    res.json({ clientSecret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(process.env.PORT || 8080);
import { API_KEY, API_SECRET_KEY, SHOPIFY_SHOP, ADMIN_ACCESS_TOKEN } from './access';

import '@shopify/shopify-api/adapters/node';
import { shopifyApi } from "@shopify/shopify-api";
import { sendEfposSMS } from '../twilio/twilioSms';
import Logger from '../utils/logging';


const shopify = shopifyApi({
  apiKey: API_KEY,
  apiSecretKey: API_SECRET_KEY,
  adminApiAccessToken: ADMIN_ACCESS_TOKEN,
  hostName: SHOPIFY_SHOP,
  apiVersion: '2024-10',
} as any);

const client: any = new shopify.clients.Rest({
  session: {
    shop: SHOPIFY_SHOP || '',
    accessToken: ADMIN_ACCESS_TOKEN,
  } as any,
});


const createOrder = async (req: any) => {
  let sendOrder = req;
  sendOrder.send_receipt = true;
try {
    Logger.info('Start create order', sendOrder);
    const draftResponse = await client.post({
      path: "orders",
      data: {
        order: sendOrder,
      },
      type: "application/json",
    });

    if (draftResponse.body && draftResponse.body.order) {
      const properOrder = draftResponse.body?.order;
      if (!properOrder) {
        Logger.error("❌ Failed to create order", draftResponse.body);
        return;
      }

      Logger.info(`✅ Order created`, properOrder);

      
      return properOrder

    } else {
      Logger.error("❌ Shopify returned an error:", draftResponse.body);
    }

  } catch (error: any) {
    Logger.error("❌ Error creating or completing draft order:", error?.response?.body || error);
  }
}


export const createShopifyOrder = async (req: any) => {
  const orderCreated = await createOrder(req);
  await sendEfposSMS(req, orderCreated);
  return orderCreated;
}
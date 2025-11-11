import { API_KEY, API_SECRET_KEY, SHOPIFY_SHOP, ADMIN_ACCESS_TOKEN } from './access';

import '@shopify/shopify-api/adapters/node';
import { shopifyApi } from "@shopify/shopify-api";

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
try {
    // Step 1: Create the Draft Order
    const draftResponse = await client.post({
      path: "orders",
      data: {
        order: req,
      },
      type: "application/json",
    });

    if (draftResponse.body && draftResponse.body.draft_order) {
      const properOrder = draftResponse.body?.draft_order;
      if (!properOrder) {
        console.error("❌ Failed to create order:", draftResponse.body);
        return;
      }

      console.log(`✅ Order created: ${properOrder.id}`);

      
      return properOrder

    } else {
      console.error("❌ Shopify returned an error:", draftResponse.body);
    }

  } catch (error: any) {
    console.error("❌ Error creating or completing draft order:", error?.response?.body || error);
  }
}


export const createShopifyOrder = async (req: any) => {
  await createOrder(req);
}
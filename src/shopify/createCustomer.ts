import '@shopify/shopify-api/adapters/node';     // REQUIRED for Node.js runtime
import { API_KEY, API_SECRET_KEY, SHOPIFY_SHOP, ADMIN_ACCESS_TOKEN } from './access';
import { shopifyApi } from "@shopify/shopify-api";

/* ----------------------------------------------
   Shopify Admin API Client
---------------------------------------------- */

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

export async function createCustomer(data: any) {

  const response = await client.post({
    path: "customers",
    data: {
      customer: {
        email: data.email,
        metafields: data.metafields || [],
      },
    },
    type: "application/json",
  });

  return response.body.customer;
}
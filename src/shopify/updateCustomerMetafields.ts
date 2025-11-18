import { shopifyApi, Session } from "@shopify/shopify-api";
import '@shopify/shopify-api/adapters/node';
import { API_KEY, API_SECRET_KEY, SHOPIFY_SHOP, ADMIN_ACCESS_TOKEN } from './access';

/* ---------------------------------------------------------
   1. Shopify Admin API Client (REST only)
--------------------------------------------------------- */

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




/* ---------------------------------------------------------
   3. Find Customer by Email (REST)
--------------------------------------------------------- */

export async function getCustomerByEmail(email: any) {

  const response = await client.get({
    path: "customers/search",
    query: { query: `email:${email}` },
  });

  return response.body.customers?.[0] || null;
}

/* ---------------------------------------------------------
   4. Update Customer Metafield (REST)
--------------------------------------------------------- */

export async function updateCustomerMetafield(customerId: any, metafield: { namespace: any; key: any; value: any; type: any; }) {

  const response = await client.post({
    path: "metafields",
    data: {
      metafield: {
        namespace: metafield.namespace,
        key: metafield.key,
        value: metafield.value,
        type: metafield.type,
        owner_id: customerId,
        owner_resource: "customer",
      },
    },
    type: "application/json",
  });

  return response.body.metafield;
}

/* ---------------------------------------------------------
   5. Combined: Update Customer Metafield by Email
--------------------------------------------------------- */


export async function updateMultipleMetafields(customerId: any, metafields = []) {
  const promises = metafields.map((mf) =>
    updateCustomerMetafield(customerId, mf)
  );

  return await Promise.all(promises);
}

export async function updateCustomerMetafieldsByEmail(email: any, metafields: any) {
  const customer = await getCustomerByEmail(email);
  if (!customer) {
    throw new Error(`Customer not found: ${email}`);
  }

  return await updateMultipleMetafields(customer.id, metafields);
}
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

export async function findCustomerByEmail(email: string) {
  const response = await client.get({
    path: "customers/search",
    query: {
      query: `email:${email}`,
    },
  });

  const customers = response.body.customers || [];

  // ⚠️ ensure exact match (Shopify search is fuzzy)
  return customers.find((c: any) => c.email === email) || null;
}

export async function getCustomerMetafield(
  customerId: number,
  namespace: string,
  key: string
) {
  const response = await client.get({
    path: `customers/${customerId}/metafields`,
  });

  const metafields = response.body.metafields || [];

  return metafields.find(
    (m: any) => m.namespace === namespace && m.key === key
  );
}

export async function upsertCustomerMetafields(
  customerId: number,
  metafields: Array<{
    namespace: string;
    key: string;
    value: string;
    type: string;
  }>
) {
  // 1. Fetch all existing metafields ONCE
  const response = await client.get({
    path: `customers/${customerId}/metafields`,
  });

  const existingMetafields = response.body.metafields || [];

  // 2. Create a lookup map
  const map = new Map<string, any>();
  for (const m of existingMetafields) {
    map.set(`${m.namespace}:${m.key}`, m);
  }

  // 3. Loop through incoming metafields
  for (const mf of metafields) {
    const key = `${mf.namespace}:${mf.key}`;
    const existing = map.get(key);

    if (existing) {
      // 🔄 Update
      await client.put({
        path: `metafields/${existing.id}`,
        data: {
          metafield: {
            id: existing.id,
            value: mf.value,
            type: mf.type,
          },
        },
        type: "application/json",
      });
    } else {
      // ➕ Create
      await client.post({
        path: `customers/${customerId}/metafields`,
        data: {
          metafield: mf,
        },
        type: "application/json",
      });
    }
  }
}

export async function upsertCustomer(data: {
  email: string;
  metafields?: Array<{
    namespace: string;
    key: string;
    value: string;
    type: string;
  }>;
}) {
  let customer = await findCustomerByEmail(data.email);

  if (!customer) {
    console.log("Creating new customer...");
    customer = await createCustomer({
      email: data.email,
      metafields: data.metafields || [], // 👈 create with metafields directly
    });

    return customer;
  }

  console.log("Customer exists:", customer.id);

  if (data.metafields?.length) {
    await upsertCustomerMetafields(customer.id, data.metafields);
  }

  return customer;
}
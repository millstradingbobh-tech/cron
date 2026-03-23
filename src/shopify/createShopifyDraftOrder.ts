import { API_KEY, API_SECRET_KEY, SHOPIFY_SHOP, ADMIN_ACCESS_TOKEN } from './access';

import '@shopify/shopify-api/adapters/node';
import { shopifyApi } from "@shopify/shopify-api";
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


const createDraftOrder = async (req: any) => {
  try {

    let sendOrder = { ...req };

    // Draft orders do NOT support transactions
    delete sendOrder.transactions;
    delete sendOrder.financial_status;
    delete sendOrder.fulfillment_status;

    if (sendOrder.metafields) {
      sendOrder.metafields = convertDraftOrderMetafields(sendOrder.metafields);
    }
    const response = await client.post({
      path: "draft_orders",
      data: {
        draft_order: sendOrder
      },
      type: "application/json",
    });
    if (response.body && response.body.draft_order) {

      const draftOrder = response.body.draft_order;

      Logger.info("✅ Draft order created", draftOrder);

      return draftOrder;

    } else {
      Logger.error("❌ Shopify returned an error:", response.body);
    }

  } catch (error: any) {
    Logger.error(
      "❌ Error creating draft order:",
      error?.response?.body || error
    );
  }
};

const convertDraftOrderMetafields = (metafields: any[] = []) => {

  const keyMap: Record<string, string> = {
    location_id: "location_id-529a",
    utm_source: "utm_source-d502",
    partner_id: "partner_id-2b9a",
    location_name: "location_name-77b3",
    kiosk_id: "kiosk_id-5d38",
  };

  return metafields.map((mf) => ({
    ...mf,
    key: keyMap[mf.key] || mf.key
  }));

};

const sendDraftOrderInvoice = async (
  draftId: string,
  email?: string
) => {
  try {

    const response = await client.post({
      path: `draft_orders/${draftId}/send_invoice`,
      data: {
        draft_order_invoice: {
          to: email, // optional (Shopify uses draft order email if not provided)
          subject: "Your Order Invoice",
          custom_message: "Please complete your purchase using the link below."
        }
      },
      type: "application/json",
    });

    Logger.info("📧 Invoice sent for draft order", draftId);

    return response.body;

  } catch (error: any) {
    Logger.error(
      "❌ Error sending invoice:",
      error?.response?.body || error
    );
  }
};

export const createShopifyDraftOrder = async (req: any) => {
  const draftOrder = await createDraftOrder(req);
  if (!draftOrder) return;

  // ✅ Send invoice instead of completing
  await sendDraftOrderInvoice(
    draftOrder.id,
    req.email // optional
  );

  return draftOrder;
}
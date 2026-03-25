import { API_KEY, API_SECRET_KEY, SHOPIFY_SHOP, ADMIN_ACCESS_TOKEN } from './access';

import '@shopify/shopify-api/adapters/node';
import { shopifyApi } from "@shopify/shopify-api";
import { sendEfposSMS } from '../twilio/twilioSms';
import Logger from '../utils/logging';
import { createOrderTransaction } from './createOrderTransaction';
import { checkPaymentStatus } from '../tap/stripe';


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

  if (req.transactions[0].gateway === 'ndis') {
    delete sendOrder.transactions;
    // delete sendOrder.financial_status;

    // sendOrder.payment_gateway_names = ['manual'];
    // sendOrder.invoice_sent_at = null;
    sendOrder.payment_pending = true;
  }
try {
    // Logger.info('Start create order', sendOrder);
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
    Logger.error("❌ Error creating or completing order:", error?.response?.body || error);
  }
}


export const createOrderWithPaymentStatusCheck = async (req: any) => {
  const isSuccess = await isPaymentSuccess(req);
  console.log(isSuccess);
  
  const orderCreated = await createOrder(req);
  if (req.transactions[0].gateway !== 'ndis' && isSuccess) {
    await createOrderTransaction(req, orderCreated);
    await sendEfposSMS(req, orderCreated);
  }
  
  return orderCreated;
}

const isPaymentSuccess = async (req: any) => {
  const paymentIntentId = req.paymentIntentId;
  const paymentStatus = await checkPaymentStatus(paymentIntentId);
  const transactionAmount = Number(req.transactions[0].amount) * 100; //dollar to cent
  const paymentAmount = Number(paymentStatus?.amount);
  const isWithinLast5Mins = paymentStatus?.created && isWithinLast5Minutes(paymentStatus?.created);
  if ((paymentStatus?.status === 'succeeded') && (transactionAmount === paymentAmount) && isWithinLast5Mins) {
    return true;
  }
  return false;
}

function isWithinLast5Minutes(created: number) {
  const now = Math.floor(Date.now() / 1000); // current time in seconds
  const diff = now - created;

  return diff >= 0 && diff <= 5 * 60;
}
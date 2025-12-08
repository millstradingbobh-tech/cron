import { API_KEY, API_SECRET_KEY, SHOPIFY_SHOP, ADMIN_ACCESS_TOKEN } from './access';

import '@shopify/shopify-api/adapters/node';
import Logger from '../utils/logging';



async function markOrderPaid(orderGid: string) {
  const query = `
    mutation MarkOrderPaid($input: OrderMarkAsPaidInput!) {
      orderMarkAsPaid(input: $input) {
        order {
          id
          name
          displayFinancialStatus
          canMarkAsPaid
          totalOutstandingSet {
            shopMoney { amount currencyCode }
          }
          transactions(first: 10) {
            id
            kind
            status
            gateway
            amountSet { shopMoney { amount currencyCode } }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const response = await fetch(`https://${SHOPIFY_SHOP}/admin/api/2025-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_ACCESS_TOKEN ?? ''
    },
    body: JSON.stringify({
      query,
      variables: {
        input: {
          id: orderGid
        }
      }
    })
  });

  const result = await response.json();
  Logger.info("Order transaction", result);
}


export const createOrderTransaction = async (req: any, orderCreated: any) => {
  const transactionCreated = await markOrderPaid("gid://shopify/Order/" + orderCreated.id);
  return transactionCreated;
}
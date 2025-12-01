import { SHOPIFY_SHOP, STOREFRONT_ACCESS_TOKEN } from './access';
import { createCustomer } from './createCustomer';
import { openAndCloseBrowser } from './openUrl';
import { updateCustomerMetafieldsByEmail } from "./updateCustomerMetafields";
import Logger from '../utils/logging';


// 1️⃣ GraphQL mutation
const mutation = `
mutation CartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          lines(first: 10) {
            edges {
              node {
                id
                quantity
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
`;


async function createCheckout(cartData: any) {

  const lineItems = [];
  for (const item of cartData.line_items) {
    lineItems.push({
      quantity: item.quantity,
      merchandiseId: "gid://shopify/ProductVariant/" + item.variant_id
    })
  }
  const variables = {
    input: {
      lines: lineItems,
      buyerIdentity: {
        email: cartData.email
      }
    }
  };


  const response = await fetch(`https://${SHOPIFY_SHOP}/api/2025-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_ACCESS_TOKEN || ''
    },
    body: JSON.stringify({ query: mutation, variables })
  });

  const json: any = await response.json();
  Logger.info("RAW RESPONSE:", json);

  if (json.data.cartCreate.userErrors.length > 0) {
    Logger.error("❌ Shopify Errors:", json.data.cartCreate.userErrors);
    return;
  }

  const cart = json.data.cartCreate.cart;
  Logger.info("✅ Cart ID:", cart.id);
  Logger.info("✅ Checkout URL:", cart.checkoutUrl); // ✅ This is your checkout link
  openAndCloseBrowser(cart.checkoutUrl);
  const metaFields = adjustMetaFields(cartData.metafields);
  try {
    await updateCustomerMetafieldsByEmail(cartData.email, metaFields);
  } catch (e: any) {
    Logger.error('Update customer failed', e);
    if (e.message.includes('Customer not found')) {
      const customer = await createCustomer({
        email: cartData.email,
        metafields: metaFields
      });

      Logger.info("No customer for abandoned checkout and customer created:", customer.id);
    }
  }
  return cart
}

const adjustMetaFields = (meta: any)=> {
  const returnMeta = meta;
  returnMeta.push({
      "namespace": "custom",
      "key": "referral_expiry",
      "type": "date",
      "value": new Date().toISOString()
  });
  return returnMeta;
}

export const createShopifyCheckout = async (reqBody: any) => {
  if (reqBody.line_items.length === 0) {
    return 'product variant cannot be empty'
  }
  if (!reqBody.email) {
    return 'email cannot be empty'
  }


  const checkout = await createCheckout(reqBody);

  return checkout;
}
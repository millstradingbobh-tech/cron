import { SHOPIFY_SHOP, STOREFRONT_ACCESS_TOKEN } from './access';
import fetch from "node-fetch";
import { openAndCloseBrowser } from './openUrl';

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


async function createCheckout(variantId: string, email: string) {
  const variables = {
    input: {
      lines: [
        {
          quantity: 1,
          merchandiseId: "gid://shopify/ProductVariant/" + variantId
        }
      ],
      buyerIdentity: {
        email: email
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
  console.log("RAW RESPONSE:", JSON.stringify(json, null, 2));

  if (json.data.cartCreate.userErrors.length > 0) {
    console.error("❌ Shopify Errors:", json.data.cartCreate.userErrors);
    return;
  }

  const cart = json.data.cartCreate.cart;
  console.log("✅ Cart ID:", cart.id);
  console.log("✅ Checkout URL:", cart.checkoutUrl); // ✅ This is your checkout link
  openAndCloseBrowser(cart.checkoutUrl);
  return cart
}


export const createShopifyCheckout = async (reqBody: { variantId: string; email: string; }) => {
  console.log(reqBody)
  if (!reqBody.variantId) {
    return 'product variant cannot be empty'
  }
  if (!reqBody.email) {
    return 'email cannot be empty'
  }
  return await createCheckout(reqBody.variantId, reqBody.email)
}
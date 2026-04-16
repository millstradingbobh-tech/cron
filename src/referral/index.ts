
import { KLAVIYO_API_KEY } from './access';

import { findCustomerByEmail, upsertCustomer } from '../shopify/createCustomer';
import { getProductById } from '../shopify/getShopifyProducts';

const EVENT_NAME='referral';

export async function referProduct({
  email,
  productId,
  companyId,
  companyName,
  locationId
}: {
  email: string;
  productId: string;
  companyId: string;
  companyName: string;
  locationId: string;
}) {
    if (!email || !productId || !companyId || !companyName || !locationId) {
        throw new Error("Data missing");
    }

    const updatedCustomer = upsertCustomer({
        email,
        metafields: [
        {
          "namespace": "custom",
          "key": "utm_source",
          "type": "single_line_text_field",
          "value": companyName,
        },
        {
          "namespace": "custom",
          "key": "location_id",
          "type": "single_line_text_field",
          "value": locationId,
        },
        {
          "namespace": "custom",
          "key": "partner_id",
          "type": "single_line_text_field",
          "value": companyId,
        },
      ]
    });

    if (!updatedCustomer) {
        console.error("Failed to update customer");
        throw new Error("Failed to update customer");
    }

    const product = await getProductById(productId);

    const response = await fetch("https://a.klaviyo.com/api/events/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
            revision: "2023-10-15", // required by Klaviyo API
        },
        body: JSON.stringify({
        data: {
            type: "event",
            attributes: {
            properties: {
                product
            },
            metric: {
                data: {
                type: "metric",
                attributes: {
                    name: EVENT_NAME,
                },
                },
            },
            profile: {
                data: {
                type: "profile",
                attributes: {
                    email: email,
                },
                },
            },
            },
        },
        }),
    });


    const finalResponse = await response.text();

    if (!response.ok) {
        console.error("Klaviyo error:", finalResponse);
        throw new Error("Failed to send event to Klaviyo");
    }

    return finalResponse;

}
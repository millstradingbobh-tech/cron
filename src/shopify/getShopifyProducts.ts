import axios from 'axios';
import { API_KEY, API_SECRET_KEY, SHOPIFY_SHOP, ADMIN_ACCESS_TOKEN } from './access';

class ShopifyGraphQLService {
  shopDomain: string | undefined;
  accessToken: string | undefined;
  url: string;
  constructor(shopDomain: string | undefined, accessToken: string | undefined) {
    this.shopDomain = shopDomain;
    this.accessToken = accessToken;
    this.url = `https://${shopDomain}/admin/api/2024-01/graphql.json`;
  }

  async getAllProducts() {
    try {
      let allProducts: any[] = [];
      let hasNextPage = true;
      let cursor = null;

      while (hasNextPage) {
        const query = this.buildProductsQuery(cursor);
        
        const response = await axios.post(
          this.url,
          { query },
          {
            headers: {
              'X-Shopify-Access-Token': this.accessToken,
              'Content-Type': 'application/json',
            },
          }
        );

        const productsData = response.data.data.products;
        const products = productsData.edges.map((edge: { node: any; }) => edge.node);
        
        allProducts = allProducts.concat(products);
        
        hasNextPage = productsData.pageInfo.hasNextPage;
        cursor = productsData.edges[productsData.edges.length - 1].cursor;
      }

      console.log(`Retrieved ${allProducts.length} products`);
      return allProducts;

    } catch (error: any) {
      console.error('Error fetching products:', error.response?.data || error.message);
      throw error;
    }
  }

  buildProductsQuery(afterCursor = null) {
    const after = afterCursor ? `after: "${afterCursor}"` : '';
    
    return `
      {
        products(first: 250 ${after}) {
          edges {
            cursor
            node {
              id
              title
              description
              handle
              vendor
              productType
              status
              tags
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price
                    sku
                    inventoryQuantity
                  }
                }
              }
              images(first: 5) {
                edges {
                  node {
                    id
                    src
                    altText
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
        }
      }
    `;
  }
}




export const getProducts = async () => {
// Usage
const graphQLService = new ShopifyGraphQLService(
  SHOPIFY_SHOP,
  ADMIN_ACCESS_TOKEN
);
let returnProducts: any[] = []
await graphQLService.getAllProducts()
  .then(products => {
    returnProducts = products;
    console.log('GraphQL Products:', JSON.stringify(products));
  })
  .catch(error => {
    console.error('Error:', error);
  });

  return returnProducts;
}
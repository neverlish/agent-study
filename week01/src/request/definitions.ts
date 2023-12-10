export const functionDefinitions = [
  {
    name: "getDeveloperLinks",
    description: "Get available links for software developer",
    parameters: {
      type: "object",
      properties: {
        keyword: {
          type: "string",
        },
      },
      required: ["keyword"],
    },
  },
  {
    name: 'productPrice',
    description: 'Get product price',
    parameters: {
      type: "object",
      properties: {
        shopName: {
          type: 'string'
        },
        productName: {
          type: "string",
        },
      },
      required: ["shopName", "productName"],
    }
  },
  {
    name: "describeService",
    description: "Describe definition of service",
    parameters: {
      type: "object",
      properties: {
        companyName: {
          type: 'string'
        },
        serviceNames: {
          type: "array",
          items: {
            type: "string"
          }
        },
      },
      required: ['companyName', "serviceNames"],
    },
  },
];

import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Cloud Functions API',
        version: '1.0.0',
        description: 'Webhook Handler API Documentation',
      },
      servers: [
        {
          url: process.env.VERCEL_PROJECT_PRODUCTION_URL 
            ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` 
            : 'http://localhost:3000',
          description: process.env.VERCEL ? 'Production server' : 'Local server',
        },
      ],
      components: {
        securitySchemes: {
          WebhookSignature: {
            type: 'apiKey',
            in: 'header',
            name: 'x-webhook-signature',
            description: 'Webhook signature for verifying the payload',
          },
        },
      },
    },
  });
  return spec;
};

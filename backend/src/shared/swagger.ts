import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Shl API', version: '1.0.0' },
  },
  apis: [
    path.join(__dirname, '../**/*.docs.{ts,js}'),
  ], // fichiers à scanner pour @swagger
};

export const swaggerSpec = swaggerJsdoc(options);

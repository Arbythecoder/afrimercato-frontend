const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Afrimercato API',
      version: '1.0.0',
      description: 'REST API for Afrimercato — African grocery delivery platform (UK). Use the Authorize button to set your JWT token.',
      contact: {
        name: 'Afrimercato Dev',
        email: 'support@afrimercato.com'
      }
    },
    servers: [
      {
        url: 'https://afrimercato-backend.fly.dev',
        description: 'Production (Fly.io)'
      },
      {
        url: 'http://localhost:5000',
        description: 'Local development'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste your JWT access token here (get it from POST /api/auth/login → data.token)'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id:       { type: 'string',  example: '507f1f77bcf86cd799439011' },
            firstName: { type: 'string',  example: 'John' },
            lastName:  { type: 'string',  example: 'Doe' },
            email:     { type: 'string',  example: 'john@example.com' },
            role:      { type: 'string',  enum: ['customer','vendor','rider','picker','admin'] },
            emailVerified: { type: 'boolean', example: false }
          }
        },
        Vendor: {
          type: 'object',
          properties: {
            _id:            { type: 'string' },
            storeName:      { type: 'string', example: 'Mama Ade Kitchen' },
            email:          { type: 'string' },
            isVerified:     { type: 'boolean' },
            approvalStatus: { type: 'string', enum: ['pending','approved','rejected'] }
          }
        },
        Product: {
          type: 'object',
          properties: {
            _id:         { type: 'string' },
            name:        { type: 'string', example: 'Fresh Plantain 1kg' },
            price:       { type: 'number', example: 3.99 },
            stock:       { type: 'integer', example: 50 },
            category:    { type: 'string', example: 'Fresh Produce' },
            vendor:      { type: 'string' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id:           { type: 'string' },
            orderNumber:   { type: 'string', example: 'ORD-20260306-001' },
            customer:      { type: 'string' },
            paymentStatus: { type: 'string', enum: ['pending','paid','failed'] },
            status:        { type: 'string', enum: ['pending','confirmed','preparing','ready','picked_up_by_rider','delivered','cancelled'] },
            totalAmount:   { type: 'number', example: 45.99 }
          }
        },
        Delivery: {
          type: 'object',
          properties: {
            _id:    { type: 'string' },
            status: { type: 'string', enum: ['pending','accepted','picked_up','in_transit','delivered'] },
            riderEarnings: { type: 'number', example: 4.50 }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth',     description: 'Login, register, verify email, OAuth' },
      { name: 'Products', description: 'Browse products and vendors (public)' },
      { name: 'Cart',     description: 'Shopping cart' },
      { name: 'Checkout', description: 'Place orders' },
      { name: 'Payments', description: 'Stripe payments and webhooks' },
      { name: 'Orders',   description: 'Customer order history and tracking' },
      { name: 'Vendor',   description: 'Vendor dashboard and store management' },
      { name: 'Rider',    description: 'Rider deliveries and earnings' },
      { name: 'Admin',    description: 'Admin panel' }
    ]
  },
  apis: ['./src/routes/*.js', './server.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

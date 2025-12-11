const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FPTU Lost & Found System API',
      version: '1.0.0',
      description: 'API Documentation for FPTU Lost & Found Tracking System - 46 Endpoints',
      contact: {
        name: 'FPTU Development Team',
        email: 'support@fptu.edu.vn'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.fptu-lostfound.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            userId: { type: 'string', example: 'sv001' },
            firstName: { type: 'string', example: 'Nguyễn' },
            lastName: { type: 'string', example: 'Văn A' },
            email: { type: 'string', example: 'sv001@fptu.edu.vn' },
            phone: { type: 'string', example: '0901234567' },
            role: { type: 'string', enum: ['student', 'staff', 'security', 'admin'], example: 'student' },
            campus: { type: 'string', enum: ['NVH', 'SHTP'], example: 'NVH' }
          }
        },
        LostItem: {
          type: 'object',
          properties: {
            reportId: { type: 'string', example: 'LF-NVH-2025-001' },
            itemName: { type: 'string', example: 'Điện thoại iPhone 13' },
            description: { type: 'string', example: 'Mặt lưng xước, bao da đỏ' },
            category: { type: 'string', enum: ['PHONE', 'WALLET', 'BAG', 'LAPTOP', 'WATCH', 'BOOK', 'KEYS', 'OTHER'] },
            color: { type: 'string', example: 'Black' },
            dateLost: { type: 'string', format: 'date-time' },
            locationLost: { type: 'string', example: 'Phòng A101, Tầng 1' },
            campus: { type: 'string', enum: ['NVH', 'SHTP'] },
            status: { type: 'string', enum: ['pending', 'verified', 'rejected', 'matched', 'returned'] }
          }
        },
        FoundItem: {
          type: 'object',
          properties: {
            foundId: { type: 'string', example: 'FF-NVH-2025-005' },
            itemName: { type: 'string', example: 'Điện thoại màu đen' },
            description: { type: 'string' },
            category: { type: 'string', enum: ['PHONE', 'WALLET', 'BAG', 'LAPTOP', 'WATCH', 'BOOK', 'KEYS', 'OTHER'] },
            color: { type: 'string' },
            campus: { type: 'string', enum: ['NVH', 'SHTP'] },
            status: { type: 'string', enum: ['unclaimed', 'matched', 'returned', 'disposed'] },
            condition: { type: 'string', enum: ['excellent', 'good', 'slightly_damaged', 'damaged'] }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'NOT_FOUND' },
                message: { type: 'string', example: 'Resource not found' }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            message: { type: 'string', example: 'Operation successful' }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints'
      },
      {
        name: 'Lost Items',
        description: 'Lost item reporting and management'
      },
      {
        name: 'Found Items',
        description: 'Found item recording and management'
      },
      {
        name: 'Upload',
        description: 'File upload endpoints'
      },
      {
        name: 'Matching',
        description: 'Matching lost and found items'
      },
      {
        name: 'Returns',
        description: 'Return transaction management'
      },
      {
        name: 'Reports',
        description: 'Reports and statistics'
      },
      {
        name: 'Users',
        description: 'User profile and management'
      },
      {
        name: 'Security',
        description: 'Security role specific endpoints'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;


const Joi = require('joi');

// Base product validation schema
const productSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  category: Joi.string().required(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().min(0).required(),
  unit: Joi.string().required(),
  isActive: Joi.boolean(),
  images: Joi.array().items(Joi.object({
    url: Joi.string().uri().required(),
    filename: Joi.string(),
    size: Joi.number()
  })),
  lowStockThreshold: Joi.number().min(0)
});

// Bulk operation validation schemas
const bulkDeleteSchema = Joi.object({
  productIds: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required()
});

const bulkStatusSchema = Joi.object({
  productIds: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required(),
  isActive: Joi.boolean().required()
});

const bulkPriceSchema = Joi.object({
  productIds: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required(),
  type: Joi.string().valid('fixed', 'percentage').required(),
  value: Joi.number().required()
});

const bulkStockSchema = Joi.object({
  productIds: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required(),
  type: Joi.string().valid('set', 'adjust').required(),
  value: Joi.number().required()
});

// Validation middleware
const validateProduct = (req, res, next) => {
  const { error } = productSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product data',
      error: error.details[0].message
    });
  }
  next();
};

const validateBulkDelete = (req, res, next) => {
  const { error } = bulkDeleteSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid bulk delete request',
      error: error.details[0].message
    });
  }
  next();
};

const validateBulkStatus = (req, res, next) => {
  const { error } = bulkStatusSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid bulk status update request',
      error: error.details[0].message
    });
  }
  next();
};

const validateBulkPrice = (req, res, next) => {
  const { error } = bulkPriceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid bulk price update request',
      error: error.details[0].message
    });
  }
  next();
};

const validateBulkStock = (req, res, next) => {
  const { error } = bulkStockSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Invalid bulk stock update request',
      error: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateProduct,
  validateBulkDelete,
  validateBulkStatus,
  validateBulkPrice,
  validateBulkStock
};
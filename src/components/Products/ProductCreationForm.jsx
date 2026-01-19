// =================================================================
// PRODUCT CREATION FORM - UK FOOD DELIVERY STANDARDS
// =================================================================
// Based on Uber Eats, Just Eat, Deliveroo
// Complete form with all features from specification

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vendorAPI } from '../../services/api';
import {
  FiUpload, FiX, FiImage, FiPlus, FiTrash2, FiCheck,
  FiPackage, FiTag, FiClock, FiCalendar
} from 'react-icons/fi';

// UK Standard Categories Suggestions
const CATEGORY_SUGGESTIONS = [
  'Fresh Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Bakery',
  'Pantry Staples',
  'Beverages',
  'Snacks',
  'Specialty Items',
  'African Foods',
  'Organic Products',
  'Frozen Foods'
];

// UK Standard Units
const UNITS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'lb', label: 'Pound (lb)' },
  { value: 'oz', label: 'Ounce (oz)' },
  { value: 'l', label: 'Litre (l)' },
  { value: 'ml', label: 'Millilitre (ml)' },
  { value: 'pint', label: 'Pint' },
  { value: 'piece', label: 'Piece' },
  { value: 'pack', label: 'Pack' },
  { value: 'bunch', label: 'Bunch' },
  { value: 'bag', label: 'Bag' },
  { value: 'box', label: 'Box' },
  { value: 'tray', label: 'Tray' }
];

// Dietary Tags
const DIETARY_TAGS = [
  '🌱 Vegan',
  '🥛 Vegetarian',
  '🌾 Gluten-Free',
  '🥜 Nut-Free',
  '☪️ Halal',
  '✡️ Kosher',
  '🌿 Organic',
  '🇮🇪 Irish Grown',
  '🌍 Local',
  '❄️ Frozen',
  '🔥 Spicy',
  '🍯 Sugar-Free',
  '🧂 Low Sodium',
  '💪 High Protein'
];

function ProductCreationForm({ product, onClose, onSave }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    originalPrice: '',
    stock: '',
    lowStockThreshold: 10,
    inStock: true,
    unlimitedStock: false,
    unit: 'kg',
    unitQuantity: '',
    tags: [],
    availability: {
      days: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true
      },
      timeSlots: {
        enabled: false,
        start: '09:00',
        end: '18:00'
      },
      maxOrdersPerDay: '',
      prepTime: 15
    }
  });

  // Images
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Variants
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        stock: product.stock || '',
        lowStockThreshold: product.lowStockThreshold || 10,
        inStock: product.inStock !== undefined ? product.inStock : true,
        unlimitedStock: product.unlimitedStock || false,
        unit: product.unit || 'kg',
        unitQuantity: product.unitQuantity || '',
        tags: product.tags || [],
        availability: product.availability || formData.availability
      });

      if (product.images && product.images.length > 0) {
        setImagePreviews(product.images.map(img => img.url));
      }

      if (product.variants && product.variants.length > 0) {
        setVariants(product.variants);
      }
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = images.length + files.length;

    if (totalImages > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    // Validate file sizes
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Each image must be less than 5MB');
        return;
      }
    }

    setImages(prev => [...prev, ...files]);

    // Clear image error if it exists
    if (errors.images) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      });
    }

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    setVariants(prev => [
      ...prev,
      {
        name: '',
        size: '',
        price: '',
        stock: '',
        inStock: true
      }
    ]);
  };

  const updateVariant = (index, field, value) => {
    setVariants(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const removeVariant = (index) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Product name is required';
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      }
      if (!formData.category.trim()) newErrors.category = 'Category is required';
    }

    if (step === 2) {
      if (images.length === 0 && imagePreviews.length === 0) {
        newErrors.images = 'At least 1 image is required (max 5)';
      }
    }

    if (step === 3) {
      if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
      if ((!formData.stock || formData.stock <= 0) && !formData.unlimitedStock) {
        newErrors.stock = 'Stock quantity is required (or check Unlimited Stock)';
      }
    }

    return newErrors;
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (images.length === 0 && imagePreviews.length === 0) {
      newErrors.images = 'At least 1 image is required (max 5)';
    }
    if (!formData.unlimitedStock && (!formData.stock || formData.stock <= 0)) {
      newErrors.stock = 'Stock quantity is required (or check Unlimited Stock)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      // Show specific errors in alert
      const errorMessages = Object.entries(errors).map(([field, msg]) => `${field}: ${msg}`).join('\n');
      alert(`Please fix the following errors:\n\n${errorMessages}`);

      // Jump to first error step
      if (errors.name || errors.description || errors.category) setCurrentStep(1);
      else if (errors.images) setCurrentStep(2);
      else if (errors.price || errors.stock) setCurrentStep(3);

      return;
    }

    try {
      setSaving(true);

      // Validate images before sending
      if (!images || images.length === 0) {
        alert('❌ At least one product image is required');
        setSaving(false);
        return;
      }

      // Create FormData for multipart upload
      const submitData = new FormData();

      // Add text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'availability' && key !== 'tags') {
          submitData.append(key, formData[key]);
        }
      });

      // Add complex objects as JSON strings
      submitData.append('availability', JSON.stringify(formData.availability));
      submitData.append('tags', JSON.stringify(formData.tags));
      submitData.append('variants', JSON.stringify(variants));

      // Add images with debug logging
      console.log(`📸 Sending ${images.length} image(s)`);
      images.forEach((image, index) => {
        console.log(`  Image ${index + 1}: ${image.name} (${image.size} bytes)`);
        submitData.append('images', image);
      });

      let response;
      if (product) {
        response = await vendorAPI.updateProduct(product._id, submitData);
      } else {
        response = await vendorAPI.createProduct(submitData);
      }

      if (response.success) {
        alert(product ? 'Product updated successfully!' : 'Product created successfully!');
        // Pass full response to parent so it can decide what to do (refresh, close modal, etc.)
        onSave(response);
      }
    } catch (error) {
      console.error('Product save error:', error);
      alert(error.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { id: 1, name: 'Basic Info' },
    { id: 2, name: 'Images' },
    { id: 3, name: 'Pricing & Stock' },
    { id: 4, name: 'Variants & Tags' },
    { id: 5, name: 'Availability' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-4xl w-full my-4 sm:my-8"
      >
        {/* Header - Mobile Optimized */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
            {product ? 'Edit Product' : 'Create New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Progress Steps - Mobile Optimized */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b bg-gray-50 overflow-x-auto">
          <div className="flex justify-between items-center min-w-max sm:min-w-0">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1 min-w-fit">
                <div className="flex items-center">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${
                      currentStep >= step.id
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step.id ? <FiCheck className="w-3 h-3 sm:w-4 sm:h-4" /> : step.id}
                  </div>
                  <span className={`ml-1 sm:ml-2 text-xs sm:text-sm whitespace-nowrap ${currentStep >= step.id ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 sm:mx-4 min-w-[20px] ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto">
            {/* STEP 1: BASIC INFO */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Organic Cherry Tomatoes"
                    maxLength={100}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1 font-semibold">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Fresh organic cherry tomatoes grown in Ireland. Sweet and juicy, perfect for salads."
                    maxLength={2000}
                  />
                  <p className="text-sm mt-1 text-gray-500">
                    {formData.description.length}/2000 characters
                  </p>
                  {errors.description && <p className="text-red-500 text-sm mt-1 font-semibold">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category * (Free Text)
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    list="category-suggestions"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.category ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Fresh Produce, Bakery, Meat & Seafood..."
                    maxLength={50}
                  />
                  <datalist id="category-suggestions">
                    {CATEGORY_SUGGESTIONS.map((cat, index) => (
                      <option key={index} value={cat} />
                    ))}
                  </datalist>
                  <p className="text-sm text-gray-500 mt-1">Type your category or select from suggestions</p>
                  {errors.category && <p className="text-red-500 text-sm mt-1 font-semibold">{errors.category}</p>}
                </div>
              </motion.div>
            )}

            {/* STEP 2: IMAGES */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images * (1-5 images, max 5MB each)
                  </label>

                  <div className="grid grid-cols-5 gap-4 mb-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border-2 border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}

                    {imagePreviews.length < 5 && (
                      <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition">
                        <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <p className={`text-sm ${errors.images ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                    {errors.images ? '⚠️ At least 1 image is required!' : 'First image will be the main product image. Drag to reorder (coming soon).'}
                  </p>
                  {errors.images && <p className="text-red-500 text-sm mt-2 font-semibold bg-red-50 p-3 rounded-lg">{errors.images}</p>}
                </div>
              </motion.div>
            )}

            {/* STEP 3: PRICING & STOCK */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price * (£)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      step="0.01"
                      min="0.01"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                        errors.price ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="2.99"
                    />
                    {errors.price && <p className="text-red-500 text-sm mt-1 font-semibold">{errors.price}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Original Price (£) - optional
                    </label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="3.99"
                    />
                    <p className="text-sm text-gray-500 mt-1">Shows discount badge</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit *
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      {UNITS.map(unit => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Quantity
                    </label>
                    <input
                      type="number"
                      name="unitQuantity"
                      value={formData.unitQuantity}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 0.5 for 500g"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      min="0"
                      disabled={formData.unlimitedStock}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                        formData.unlimitedStock ? 'bg-gray-100 border-gray-300' :
                        errors.stock ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="50"
                    />
                    {errors.stock && <p className="text-red-500 text-sm mt-1 font-semibold">{errors.stock}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Low Stock Alert
                    </label>
                    <input
                      type="number"
                      name="lowStockThreshold"
                      value={formData.lowStockThreshold}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="10"
                    />
                  </div>
                </div>

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="inStock"
                      checked={formData.inStock}
                      onChange={handleChange}
                      className="w-5 h-5 text-green-500 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium">In Stock</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="unlimitedStock"
                      checked={formData.unlimitedStock}
                      onChange={handleChange}
                      className="w-5 h-5 text-green-500 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium">Unlimited Stock</span>
                  </label>
                </div>
              </motion.div>
            )}

            {/* STEP 4: VARIANTS & TAGS */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Variants */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Size Variants (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={addVariant}
                      className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                    >
                      <FiPlus /> Add Variant
                    </button>
                  </div>

                  {variants.map((variant, index) => (
                    <div key={index} className="grid grid-cols-5 gap-2 mb-2 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="text"
                        placeholder="Name (e.g., Small)"
                        value={variant.name}
                        onChange={(e) => updateVariant(index, 'name', e.target.value)}
                        className="px-3 py-2 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="Size (e.g., 250g)"
                        value={variant.size}
                        onChange={(e) => updateVariant(index, 'size', e.target.value)}
                        className="px-3 py-2 border rounded"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, 'price', e.target.value)}
                        className="px-3 py-2 border rounded"
                        step="0.01"
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        value={variant.stock}
                        onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                        className="px-3 py-2 border rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Dietary & Product Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_TAGS.map((tag, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                          formData.tags.includes(tag)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: AVAILABILITY */}
            {currentStep === 5 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Available Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(formData.availability.days).map(day => (
                      <label key={day} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <input
                          type="checkbox"
                          checked={formData.availability.days[day]}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              availability: {
                                ...prev.availability,
                                days: {
                                  ...prev.availability.days,
                                  [day]: e.target.checked
                                }
                              }
                            }));
                          }}
                          className="w-4 h-4 text-green-500 rounded"
                        />
                        <span className="text-sm capitalize">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preparation Time (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.availability.prepTime}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          availability: {
                            ...prev.availability,
                            prepTime: parseInt(e.target.value) || 15
                          }
                        }));
                      }}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Orders Per Day (optional)
                    </label>
                    <input
                      type="number"
                      value={formData.availability.maxOrdersPerDay}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          availability: {
                            ...prev.availability,
                            maxOrdersPerDay: e.target.value
                          }
                        }));
                      }}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="50"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={() => {
                    // Validate current step before proceeding
                    const stepErrors = validateStep(currentStep);
                    if (Object.keys(stepErrors).length > 0) {
                      setErrors(stepErrors);
                      const errorMessages = Object.entries(stepErrors).map(([field, msg]) => `${field}: ${msg}`).join('\n');
                      alert(`Please fix the following before continuing:\n\n${errorMessages}`);
                      return;
                    }
                    // Clear errors and move to next step
                    setErrors({});
                    setCurrentStep(prev => Math.min(5, prev + 1));
                  }}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheck /> {product ? 'Update Product' : 'Create Product'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default ProductCreationForm;

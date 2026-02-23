'use client';

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
  X,
  Plus,
  Upload,
  Trash2,
  Save,
  Edit2,
  Package,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';

interface ProductDashboardProps {
  defaultProductType?: 'yak-milk' | 'puff-treat' | 'highland-mix';
}

const ProductDashboard = ({ defaultProductType }: ProductDashboardProps) => {
  const SUBSCRIPTION_INTERVAL_OPTIONS = ['1 Week', '2 Weeks', '1 Month', '2 Months'];

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: 'Original',
    productType: defaultProductType || 'yak-milk',
    variety: '',
    badge: '',
    description: '',
    rating: '0',
    reviews: '0',
    features: [''],
    sizes: [{ label: '', value: '', price: '', originalPrice: '' }],
    bulkPricing: [{ quantity: '', price: '', originalPrice: '', discount: '' }],
    // Advanced pricing settings
    taxPercentage: '0',
    deliveryCharge: '0',
    subscriptionEnabled: false,
    subscriptionDiscount: '0',
    subscriptionIntervals: [] as string[],
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Products sidebar state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Varieties state
  const [varieties, setVarieties] = useState([]);
  const [loadingVarieties, setLoadingVarieties] = useState(true);

  // Debug state
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchVarieties();
  }, [formData.productType]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
      galleryPreviews.forEach((p) => {
        if (p.startsWith('blob:')) URL.revokeObjectURL(p);
      });
    };
  }, [imagePreview, galleryPreviews]);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

  const fetchVarieties = async () => {
    try {
      setLoadingVarieties(true);
      const response = await fetch(`${API_BASE}/variety`);
      const result = await response.json();
      if (result.success) {
        setVarieties(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching varieties:', error);
      setMessage({ type: 'error', text: 'Failed to load varieties' });
    } finally {
      setLoadingVarieties(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const typeFilter = defaultProductType || formData.productType;
      const url = `${API_BASE}/products?type=${typeFilter}`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) setProducts(result.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setDebugInfo(`Fetch Error: ${error.message}`);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Prevent changing productType when defaultProductType is set
    if (name === 'productType' && defaultProductType) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setGalleryImages((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addFeature = () => setFormData((prev) => ({ ...prev, features: [...prev.features, ''] }));
  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };
  const removeFeature = (index) =>
    setFormData((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));

  const addSize = () => setFormData((prev) => ({ ...prev, sizes: [...prev.sizes, { label: '', value: '', price: '', originalPrice: '' }] }));
  const updateSize = (index, field, value) => {
    const newSizes = [...formData.sizes];
    newSizes[index][field] = value;
    setFormData((prev) => ({ ...prev, sizes: newSizes }));
  };
  const removeSize = (index) =>
    setFormData((prev) => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== index) }));

  const addBulkPrice = () =>
    setFormData((prev) => ({
      ...prev,
      bulkPricing: [...prev.bulkPricing, { quantity: '', price: '', originalPrice: '', discount: '' }],
    }));
  const updateBulkPrice = (index, field, value) => {
    const newBulkPricing = [...formData.bulkPricing];
    newBulkPricing[index][field] = value;
    setFormData((prev) => ({ ...prev, bulkPricing: newBulkPricing }));
  };
  const removeBulkPrice = (index) =>
    setFormData((prev) => ({ ...prev, bulkPricing: prev.bulkPricing.filter((_, i) => i !== index) }));

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      price: (product.price ?? '').toString(),
      originalPrice: (product.originalPrice ?? '').toString(),
      category: product.category || 'Original',
      productType: defaultProductType || product.productType || 'yak-milk',
      variety: product.variety?._id || product.variety || '',
      badge: product.badge || '',
      description: product.description || '',
      rating: (product.rating ?? 0).toString(),
      reviews: (product.reviews ?? 0).toString(),
      features: product.features?.length ? product.features : [''],
      sizes: product.sizes?.length
        ? product.sizes.map((s: any) => ({
            label: s.label || '',
            value: s.value || '',
            price: (s.price != null ? s.price : '').toString(),
            originalPrice: (s.originalPrice != null ? s.originalPrice : '').toString(),
          }))
        : [{ label: '', value: '', price: '', originalPrice: '' }],
      bulkPricing: product.bulkPricing?.length
        ? product.bulkPricing
        : [{ quantity: '', price: '', originalPrice: '', discount: '' }],
      taxPercentage: (product.pricingSettings?.taxPercentage ?? 0).toString(),
      deliveryCharge: (product.pricingSettings?.deliveryCharge ?? 0).toString(),
      subscriptionEnabled: product.subscriptionSettings?.isEnabled ?? false,
      subscriptionDiscount: (product.subscriptionSettings?.discountPercentage ?? 0).toString(),
      subscriptionIntervals: product.subscriptionSettings?.intervals ?? [],
    });
    setImage(null);
    setImagePreview(product.image || null);
    setGalleryImages([]);
    setGalleryPreviews(product.gallery || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      originalPrice: '',
      category: 'Original',
      productType: defaultProductType || 'yak-milk',
      variety: '',
      badge: '',
      description: '',
      rating: '0',
      reviews: '0',
      features: [''],
      sizes: [{ label: '', value: '', price: '', originalPrice: '' }],
      bulkPricing: [{ quantity: '', price: '', originalPrice: '', discount: '' }],
      taxPercentage: '0',
      deliveryCharge: '0',
      subscriptionEnabled: false,
      subscriptionDiscount: '0',
      subscriptionIntervals: [],
    });
    setImage(null);
    setImagePreview(null);
    setGalleryImages([]);
    setGalleryPreviews([]);
    setMessage({ type: '', text: '' });
    setDebugInfo('');
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete?._id) return;

    try {
      setLoading(true);
      const token = Cookies.get('token');

      const response = await fetch(`${API_BASE}/products/${productToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Product deleted successfully!' });
        setShowDeleteModal(false);
        setProductToDelete(null);
        if (editingProduct?._id === productToDelete._id) handleCancelEdit();
        fetchProducts();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to delete product' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while deleting' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form submitted!');
    setLoading(true);
    setMessage({ type: '', text: '' });
    setDebugInfo('Starting submission...');

    try {
      if (!formData.variety) {
        setMessage({ type: 'error', text: 'Please select a variety' });
        setLoading(false);
        return;
      }

      if (!editingProduct && !image) {
        setMessage({ type: 'error', text: 'Please upload a main product image' });
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();

      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('originalPrice', formData.originalPrice);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('productType', formData.productType);
      formDataToSend.append('variety', formData.variety);
      formDataToSend.append('badge', formData.badge);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('rating', formData.rating);
      formDataToSend.append('reviews', formData.reviews);

      formDataToSend.append('features', JSON.stringify(formData.features.filter((f) => f.trim() !== '')));
      formDataToSend.append('sizes', JSON.stringify(
        formData.sizes
          .filter((s) => s.label && s.value)
          .map((s) => ({
            label: s.label,
            value: s.value,
            ...(s.price ? { price: parseFloat(s.price) } : {}),
            ...(s.originalPrice ? { originalPrice: parseFloat(s.originalPrice) } : {}),
          }))
      ));
      formDataToSend.append('bulkPricing', JSON.stringify(formData.bulkPricing.filter((bp) => bp.quantity && bp.price)));

      // Advanced pricing settings
      formDataToSend.append('pricingSettings', JSON.stringify({
        taxPercentage: parseFloat(formData.taxPercentage) || 0,
        deliveryCharge: parseFloat(formData.deliveryCharge) || 0,
      }));
      formDataToSend.append('subscriptionSettings', JSON.stringify({
        isEnabled: formData.subscriptionEnabled,
        discountPercentage: parseFloat(formData.subscriptionDiscount) || 0,
        intervals: formData.subscriptionIntervals,
      }));

      if (image) formDataToSend.append('image', image);

      galleryImages.forEach((file) => {
        formDataToSend.append('gallery', file);
      });

      const token = Cookies.get('token');

      const url = editingProduct
        ? `${API_BASE}/products/${editingProduct._id}`
        : `${API_BASE}/products`;

      const method = editingProduct ? 'PUT' : 'POST';

      console.log('Sending request to:', url);
      console.log('Method:', method);

      setDebugInfo(`Sending ${method} to ${url}...`);

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      console.log('Response status:', response.status);
      setDebugInfo(`Response status: ${response.status}`);

      let result;
      try {
        result = await response.json();
        console.log('Response data:', result);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        setMessage({ type: 'error', text: 'Server returned invalid response' });
        setDebugInfo(`Parse error: ${parseError.message}`);
        setLoading(false);
        return;
      }

      if (response.ok && result.success) {
        setMessage({
          type: 'success',
          text: editingProduct ? 'Product updated successfully!' : 'Product created successfully!',
        });
        setDebugInfo('Success!');

        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);

        handleCancelEdit();
        fetchProducts();
      } else {
        const errorMsg = result.message || result.error || 'Failed to save product';
        console.error('Server error:', errorMsg);
        setMessage({ type: 'error', text: errorMsg });
        setDebugInfo(`Error: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Caught error:', error);
      setMessage({ type: 'error', text: `Network error: ${error.message}` });
      setDebugInfo(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
      console.log('Form submission complete');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 relative">
      <button
        type="button"
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed top-24 right-4 z-50 bg-amber-500 text-white p-3 rounded-full shadow-lg hover:bg-amber-600 transition"
      >
        {showSidebar ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h1>
            {editingProduct && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {debugInfo && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="font-mono">{debugInfo}</span>
            </div>
          )}

          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Himalayan Yak Dog Chew"
                  />
                </div>

                {/* Variety Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Variety *</label>
                  {loadingVarieties ? (
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                      Loading varieties...
                    </div>
                  ) : (
                    <select
                      name="variety"
                      value={formData.variety}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="">Select a variety</option>
                      {varieties.map((variety) => (
                        <option key={variety._id} value={variety._id}>
                          {variety.name} ({variety.category})
                        </option>
                      ))}
                    </select>
                  )}
                  {varieties.length === 0 && !loadingVarieties && (
                    <p className="text-xs text-red-600 mt-1">
                      No varieties found. Please create varieties first.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="Original">Original</option>
                    <option value="Flavored">Flavored</option>
                  </select>
                </div>

                {/* Only show Product Type dropdown if no defaultProductType */}
                {!defaultProductType ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Type *</label>
                    <select
                      name="productType"
                      value={formData.productType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="yak-milk">Yak Milk Chew</option>
                      <option value="puff-treat">Puff Treat</option>
                      <option value="highland-mix">Highland Mix Chew</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                      {defaultProductType === 'puff-treat' && 'Puff Treat'}
                      {defaultProductType === 'highland-mix' && 'Highland Mix Chew'}
                      {defaultProductType === 'yak-milk' && 'Yak Milk Chew'}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (£) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="2.99"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (£) *</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    required
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="3.50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating (0-5)</label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="4.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Reviews</label>
                  <input
                    type="number"
                    name="reviews"
                    value={formData.reviews}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="1174"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Badge (Optional)</label>
                  <input
                    type="text"
                    name="badge"
                    value={formData.badge}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="NEW PRODUCT"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Long Lasting, Full of Calcium & Protein"
                  />
                </div>
              </div>
            </div>

            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Main Product Image {!editingProduct && '*'}
              </h2>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-amber-500 transition">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload main image</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>

                {imagePreview && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Gallery Images (Optional)</h2>
              <label className="cursor-pointer block mb-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-amber-500 transition">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload gallery images</p>
                  <p className="text-xs text-gray-400 mt-1">Select multiple images (PNG, JPG)</p>
                </div>
                <input type="file" accept="image/*" multiple onChange={handleGalleryChange} className="hidden" />
              </label>

              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {galleryPreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group"
                    >
                      <img src={preview} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <Trash2 className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-b pb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Features</h2>
                <button
                  type="button"
                  onClick={addFeature}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Feature
                </button>
              </div>
              <div className="space-y-3">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="100% Natural Ingredients"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-b pb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-700">Sizes</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Price per size is optional — leave blank to use the product base price</p>
                </div>
                <button
                  type="button"
                  onClick={addSize}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Size
                </button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-500 px-1">
                  <span>Label (Display)</span>
                  <span>Value (ID)</span>
                  <span>Sale Price £</span>
                  <span>Original Price £</span>
                </div>
                {formData.sizes.map((size, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={size.label}
                      onChange={(e) => updateSize(index, 'label', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                      placeholder="Small 30-40g"
                    />
                    <input
                      type="text"
                      value={size.value}
                      onChange={(e) => updateSize(index, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                      placeholder="small-30-40g"
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={size.price}
                      onChange={(e) => updateSize(index, 'price', e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                      placeholder="4.49"
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={size.originalPrice}
                      onChange={(e) => updateSize(index, 'originalPrice', e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                      placeholder="7.50"
                    />
                    <button
                      type="button"
                      onClick={() => removeSize(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-b pb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Bulk Pricing</h2>
                <button
                  type="button"
                  onClick={addBulkPrice}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Tier
                </button>
              </div>
              <div className="space-y-3">
                {formData.bulkPricing.map((pricing, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="number"
                      value={pricing.quantity}
                      onChange={(e) => updateBulkPrice(index, 'quantity', e.target.value)}
                      className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Qty"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={pricing.price}
                      onChange={(e) => updateBulkPrice(index, 'price', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Price"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={pricing.originalPrice}
                      onChange={(e) => updateBulkPrice(index, 'originalPrice', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Original"
                    />
                    <input
                      type="number"
                      value={pricing.discount}
                      onChange={(e) => updateBulkPrice(index, 'discount', e.target.value)}
                      className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Disc %"
                    />
                    <button
                      type="button"
                      onClick={() => removeBulkPrice(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Pricing Settings */}
            <div className="border-b pb-6">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                <h2 className="text-xl font-semibold text-gray-700 mb-1">Advanced Pricing Settings</h2>
                <p className="text-sm text-gray-500 mb-5">Configure tax, delivery charges, and subscription options per product.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tax Percentage (%)</label>
                    <input
                      type="number"
                      name="taxPercentage"
                      value={formData.taxPercentage}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g. 20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Charge (£)</label>
                    <input
                      type="number"
                      name="deliveryCharge"
                      value={formData.deliveryCharge}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g. 2.99"
                    />
                  </div>
                </div>

                {/* Subscription Toggle */}
                <div className="border-t border-purple-200 pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-gray-700">Enable Subscription</h3>
                      <p className="text-sm text-gray-500">Allow customers to subscribe for repeat deliveries</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, subscriptionEnabled: !prev.subscriptionEnabled }))}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                        formData.subscriptionEnabled ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                          formData.subscriptionEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {formData.subscriptionEnabled && (
                    <div className="space-y-4 bg-white rounded-lg p-4 border border-purple-100">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Discount (%)</label>
                        <input
                          type="number"
                          name="subscriptionDiscount"
                          value={formData.subscriptionDiscount}
                          onChange={handleChange}
                          min="0"
                          max="100"
                          step="1"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g. 15"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Intervals</label>
                        <div className="grid grid-cols-2 gap-2">
                          {SUBSCRIPTION_INTERVAL_OPTIONS.map((interval) => (
                            <label
                              key={interval}
                              className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                formData.subscriptionIntervals.includes(interval)
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.subscriptionIntervals.includes(interval)}
                                onChange={(e) => {
                                  setFormData(prev => ({
                                    ...prev,
                                    subscriptionIntervals: e.target.checked
                                      ? [...prev.subscriptionIntervals, interval]
                                      : prev.subscriptionIntervals.filter(i => i !== interval),
                                  }));
                                }}
                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                              />
                              <span className="text-sm font-medium text-gray-700">{interval}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {editingProduct ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl transition-transform duration-300 z-40 ${
          showSidebar ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '320px' }}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <h2 className="text-lg font-bold">Products ({products.length})</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSidebar(false)}
                className="hover:bg-white hover:bg-opacity-20 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {loadingProducts ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No products yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-gray-50 rounded-lg p-3 hover:shadow-md transition border border-gray-200"
                  >
                    <div className="flex gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-800 truncate">{product.name}</h3>
                        <p className="text-xs text-gray-600 truncate">{product.description}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {product.productType && (
                            <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                              {product.productType}
                            </span>
                          )}
                          {product.variety && (
                            <span className="text-xs text-purple-600 font-medium">
                              {product.variety.name || product.variety.category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-amber-600">£{product.price}</span>
                          <span className="text-xs text-gray-400 line-through">£{product.originalPrice}</span>
                        </div>

                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(product)}
                            className="flex-1 py-1 px-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center justify-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteClick(product)}
                            className="flex-1 py-1 px-2 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t">
            <button
              type="button"
              onClick={fetchProducts}
              className="w-full py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Refresh List
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteModal(false)} />

          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Delete Product</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold">{productToDelete?.name}</span>?
                </p>
              </div>
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100"
                onClick={() => setShowDeleteModal(false)}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={confirmDelete}
                className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition disabled:opacity-60"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDashboard;

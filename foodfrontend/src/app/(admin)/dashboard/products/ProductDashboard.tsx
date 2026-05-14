'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  X,
  Plus,
  Upload,
  Trash2,
  Save,
  Edit2,
  Package,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import { FiArrowLeft, FiRefreshCw, FiSearch } from 'react-icons/fi';

interface ProductDashboardProps {
  defaultProductType?: 'yak-milk' | 'puff-treat' | 'highland-mix';
}

const ProductDashboard = ({ defaultProductType }: ProductDashboardProps) => {
  const searchParams = useSearchParams();
  const editIdFromUrl = searchParams?.get('edit') || null;
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
    sizes: [{ label: '', value: '', price: '', originalPrice: '', bulkTiers: [] as any[], stockQuantity: '' }],
    bulkPricing: [{ quantity: '', price: '', originalPrice: '', discount: '' }],
    // Advanced pricing settings
    taxPercentage: '0',
    deliveryCharge: '0',
    subscriptionEnabled: false,
    subscriptionDiscount: '0',
    // Subscribe & Save: admin enters specific week/month numbers
    weeklyOptions: [] as number[],
    monthlyOptions: [] as number[],
    // Stock management
    trackStock: false,
    stockQuantity: '0',
  });

  const [weekInput, setWeekInput] = useState('');
  const [monthInput, setMonthInput] = useState('');

  interface ProductItem {
    _id: string;
    name: string;
    category: string;
    image: string;
    description: string;
    productType: string;
    variety?: { name?: string; category?: string } | string;
    price: string | number;
    originalPrice: string | number;
    [key: string]: unknown;
  }

  interface VarietyItem {
    _id: string;
    name: string;
    category: string;
    [key: string]: unknown;
  }

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Products sidebar state
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [showListDrawer, setShowListDrawer] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);
  const [showArchivedView, setShowArchivedView] = useState(false);
  const [archivedProducts, setArchivedProducts] = useState<ProductItem[]>([]);
  const [loadingArchived, setLoadingArchived] = useState(false);

  // Varieties state
  const [varieties, setVarieties] = useState<VarietyItem[]>([]);
  const [loadingVarieties, setLoadingVarieties] = useState(true);

  // Collapsible sizes state
  const [expandedSizes, setExpandedSizes] = useState<boolean[]>([]);

  // Debug state
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchVarieties();
  }, [formData.productType]);

  // Auto-load a product into edit mode when ?edit=<id> is in the URL.
  // Uses the admin endpoint so archived products can also be opened for editing.
  useEffect(() => {
    if (!editIdFromUrl) return;
    let cancelled = false;
    (async () => {
      try {
        const token = Cookies.get('token');
        const res = await fetch(`${API_BASE}/products/admin/${editIdFromUrl}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const result = await res.json();
        if (cancelled) return;
        if (result?.success && result.data) {
          handleEdit(result.data);
        } else {
          setMessage({
            type: 'error',
            text: result?.message || 'Product not found — it may have been deleted.',
          });
        }
      } catch (e) {
        if (!cancelled) {
          setMessage({ type: 'error', text: 'Network error while loading product for edit.' });
        }
        console.error('Failed to load product for edit:', e);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editIdFromUrl]);

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

  const fetchArchivedProducts = async () => {
    try {
      setLoadingArchived(true);
      const token = Cookies.get('token');
      const response = await fetch(`${API_BASE}/products/archived`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) setArchivedProducts(result.data || []);
    } catch (error) {
      console.error('Error fetching archived products:', error);
    } finally {
      setLoadingArchived(false);
    }
  };

  const handleRestoreProduct = async (product: ProductItem) => {
    try {
      const token = Cookies.get('token');
      const response = await fetch(`${API_BASE}/products/${product._id}/restore`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: `"${product.name}" restored successfully!` });
        fetchArchivedProducts();
        fetchProducts();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to restore product' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred while restoring' });
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
    const files = Array.from(e.target.files || []) as File[];
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

  const addSize = () => {
    setFormData((prev) => ({ ...prev, sizes: [...prev.sizes, { label: '', value: '', price: '', originalPrice: '', bulkTiers: [], stockQuantity: '' }] }));
    setExpandedSizes((prev) => [...prev, false]);
  };
  const updateSize = (index, field, value) => {
    const newSizes = [...formData.sizes];
    newSizes[index][field] = value;
    setFormData((prev) => ({ ...prev, sizes: newSizes }));
  };
  const removeSize = (index) => {
    setFormData((prev) => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== index) }));
    setExpandedSizes((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSizeExpand = (index: number) => {
    setExpandedSizes((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const addBulkTierToSize = (sizeIdx: number) => {
    const newSizes = [...formData.sizes];
    newSizes[sizeIdx] = {
      ...newSizes[sizeIdx],
      bulkTiers: [...(newSizes[sizeIdx].bulkTiers || []), { minQty: '', salePrice: '', originalPrice: '', discountPercent: '' }],
    };
    setFormData((prev) => ({ ...prev, sizes: newSizes }));
  };

  const updateBulkTier = (sizeIdx: number, tierIdx: number, field: string, value: string) => {
    const newSizes = [...formData.sizes];
    const tiers = [...(newSizes[sizeIdx].bulkTiers || [])];
    tiers[tierIdx] = { ...tiers[tierIdx], [field]: value };
    // Auto-calculate discount percent
    if (field === 'salePrice' || field === 'originalPrice') {
      const sp = parseFloat(field === 'salePrice' ? value : tiers[tierIdx].salePrice);
      const op = parseFloat(field === 'originalPrice' ? value : tiers[tierIdx].originalPrice);
      if (sp > 0 && op > 0 && op > sp) {
        tiers[tierIdx].discountPercent = Math.round(((op - sp) / op) * 100).toString();
      }
    }
    newSizes[sizeIdx] = { ...newSizes[sizeIdx], bulkTiers: tiers };
    setFormData((prev) => ({ ...prev, sizes: newSizes }));
  };

  const removeBulkTier = (sizeIdx: number, tierIdx: number) => {
    const newSizes = [...formData.sizes];
    newSizes[sizeIdx] = {
      ...newSizes[sizeIdx],
      bulkTiers: (newSizes[sizeIdx].bulkTiers || []).filter((_, i) => i !== tierIdx),
    };
    setFormData((prev) => ({ ...prev, sizes: newSizes }));
  };

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
            bulkTiers: (s.bulkTiers || []).map((t: any) => ({
              minQty: (t.minQty ?? '').toString(),
              salePrice: (t.salePrice ?? '').toString(),
              originalPrice: (t.originalPrice ?? '').toString(),
              discountPercent: (t.discountPercent ?? '').toString(),
            })),
            stockQuantity: (s.stockQuantity ?? '').toString(),
          }))
        : [{ label: '', value: '', price: '', originalPrice: '', bulkTiers: [], stockQuantity: '' }],
      bulkPricing: product.bulkPricing?.length
        ? product.bulkPricing
        : [{ quantity: '', price: '', originalPrice: '', discount: '' }],
      taxPercentage: (product.pricingSettings?.taxPercentage ?? 0).toString(),
      deliveryCharge: (product.pricingSettings?.deliveryCharge ?? 0).toString(),
      subscriptionEnabled: product.subscriptionSettings?.isEnabled ?? false,
      subscriptionDiscount: (product.subscriptionSettings?.discountPercentage ?? 0).toString(),
      weeklyOptions: product.subscriptionSettings?.weeklyOptions ?? [],
      monthlyOptions: product.subscriptionSettings?.monthlyOptions ?? [],
      trackStock: product.trackStock ?? false,
      stockQuantity: (product.stockQuantity ?? 0).toString(),
    });
    setExpandedSizes(new Array(product.sizes?.length || 1).fill(false));
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
      sizes: [{ label: '', value: '', price: '', originalPrice: '', bulkTiers: [], stockQuantity: '' }],
      bulkPricing: [{ quantity: '', price: '', originalPrice: '', discount: '' }],
      taxPercentage: '0',
      deliveryCharge: '0',
      subscriptionEnabled: false,
      subscriptionDiscount: '0',
      weeklyOptions: [],
      monthlyOptions: [],
      trackStock: false,
      stockQuantity: '0',
    });
    setExpandedSizes([]);
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

      const response = await fetch(`${API_BASE}/products/${productToDelete._id}/archive`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Product archived successfully!' });
        setShowDeleteModal(false);
        setProductToDelete(null);
        if (editingProduct?._id === productToDelete._id) handleCancelEdit();
        fetchProducts();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to archive product' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while archiving' });
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
            bulkTiers: (s.bulkTiers || [])
              .filter((t: any) => t.minQty && t.salePrice)
              .map((t: any) => ({
                minQty: parseInt(t.minQty),
                salePrice: parseFloat(t.salePrice),
                originalPrice: parseFloat(t.originalPrice) || parseFloat(t.salePrice),
                discountPercent: parseFloat(t.discountPercent) || 0,
              })),
            stockQuantity: parseInt(s.stockQuantity) || 0,
          }))
      ));
      formDataToSend.append('bulkPricing', JSON.stringify(formData.bulkPricing.filter((bp) => bp.quantity && bp.price)));

      // Stock management
      formDataToSend.append('trackStock', formData.trackStock.toString());
      formDataToSend.append('stockQuantity', formData.stockQuantity);

      // Advanced pricing settings
      formDataToSend.append('pricingSettings', JSON.stringify({
        taxPercentage: parseFloat(formData.taxPercentage) || 0,
        deliveryCharge: parseFloat(formData.deliveryCharge) || 0,
      }));
      formDataToSend.append('subscriptionSettings', JSON.stringify({
        isEnabled: formData.subscriptionEnabled,
        discountPercentage: parseFloat(formData.subscriptionDiscount) || 0,
        weeklyOptions: formData.weeklyOptions,
        monthlyOptions: formData.monthlyOptions,
      }));

      if (image) formDataToSend.append('image', image);

      galleryImages.forEach((file) => {
        formDataToSend.append('gallery', file);
      });

      // On edit: tell backend which existing gallery URLs to keep (covers removals too)
      if (editingProduct) {
        const existingUrls = galleryPreviews.filter(
          (p: any) => typeof p === 'string' && p.startsWith('http')
        );
        formDataToSend.append('existingGallery', JSON.stringify(existingUrls));
      }

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

  const filteredProducts = products.filter(p => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description as string).toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-5 md:p-7 min-h-screen bg-[#f5f7fa]">

      {/* Page header */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors">
            <FiArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              {defaultProductType === 'puff-treat' ? 'Puff Treats'
                : defaultProductType === 'highland-mix' ? 'Highland Mix'
                : 'Products'}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {editingProduct ? `Editing ${editingProduct.name}` : 'Add and manage products'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowListDrawer(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <Package className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Products</span>
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full bg-amber-100 text-amber-700 tabular-nums">
              {showArchivedView ? archivedProducts.length : products.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              const next = !showArchivedView;
              setShowArchivedView(next);
              if (next) fetchArchivedProducts();
              setShowListDrawer(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <span className="hidden sm:inline">{showArchivedView ? 'View Active' : 'View Archived'}</span>
            <span className="sm:hidden">{showArchivedView ? 'Active' : 'Archived'}</span>
          </button>
          <button
            onClick={fetchProducts}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors"
          >
            <FiRefreshCw size={14} className={loadingProducts ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${editingProduct ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
                {editingProduct ? 'Edit product' : 'New product'}
              </h2>
            </div>
            {editingProduct && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs font-medium px-3 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
              >
                Cancel
              </button>
            )}
          </div>
          <div className="p-6 md:p-7">

          {debugInfo && (
            <div className="mb-3 p-2.5 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-800 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span className="font-mono">{debugInfo}</span>
            </div>
          )}

          {message.text && (
            <div
              className={`mb-4 px-3 py-2 rounded-md text-xs font-medium ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                  : 'bg-red-50 text-red-800 border border-red-100'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-7">
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.14em] mb-3.5">Basic information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-colors"
                    placeholder="Himalayan Yak Dog Chew"
                  />
                </div>

                {/* Variety Select */}
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Variety *</label>
                  {loadingVarieties ? (
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-500">
                      Loading varieties...
                    </div>
                  ) : (
                    <select
                      name="variety"
                      value={formData.variety}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-colors"
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
                  <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-colors"
                  >
                    <option value="Original">Original</option>
                    <option value="Flavored">Flavored</option>
                  </select>
                </div>

                {/* Only show Product Type dropdown if no defaultProductType */}
                {!defaultProductType ? (
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Product Type *</label>
                    <select
                      name="productType"
                      value={formData.productType}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-colors"
                    >
                      <option value="yak-milk">Yak Milk Chew</option>
                      <option value="puff-treat">Puff Treat</option>
                      <option value="highland-mix">Highland Mix Chew</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Product Type</label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700">
                      {defaultProductType === 'puff-treat' && 'Puff Treat'}
                      {defaultProductType === 'highland-mix' && 'Highland Mix Chew'}
                      {defaultProductType === 'yak-milk' && 'Yak Milk Chew'}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Price (£) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-colors"
                    placeholder="2.99"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Original Price (£) *</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    required
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-colors"
                    placeholder="3.50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Rating (0-5)</label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="5"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-colors"
                    placeholder="4.5"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Number of Reviews</label>
                  <input
                    type="number"
                    name="reviews"
                    value={formData.reviews}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-colors"
                    placeholder="1174"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Badge (Optional)</label>
                  <input
                    type="text"
                    name="badge"
                    value={formData.badge}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-colors"
                    placeholder="NEW PRODUCT"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-colors"
                    placeholder="Long Lasting, Full of Calcium & Protein"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.14em] mb-3.5">
                Main image {!editingProduct && <span className="text-red-500 normal-case tracking-normal">*</span>}
              </h3>
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="border border-dashed border-gray-200 rounded-lg px-4 py-3 text-center hover:border-amber-400 hover:bg-amber-50/30 transition">
                    <Upload className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                    <p className="text-xs text-gray-600">Click to upload</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG up to 5MB</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>

                {imagePreview && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-0.5 right-0.5 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.14em] mb-3.5">Gallery <span className="text-gray-300 normal-case tracking-normal">(optional)</span></h3>
              <label className="cursor-pointer block mb-3">
                <div className="border border-dashed border-gray-200 rounded-lg px-4 py-3 text-center hover:border-amber-400 hover:bg-amber-50/30 transition">
                  <Upload className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                  <p className="text-xs text-gray-600">Click to upload gallery</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Select multiple PNG/JPG</p>
                </div>
                <input type="file" accept="image/*" multiple onChange={handleGalleryChange} className="hidden" />
              </label>

              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {galleryPreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-md overflow-hidden border border-gray-200 group"
                    >
                      <img src={preview} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        aria-label="Remove image"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.14em]">Features</h3>
                <button
                  type="button"
                  onClick={addFeature}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold bg-gray-900 text-white rounded-md hover:bg-gray-800 transition"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>
              <div className="space-y-3">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-colors"
                      placeholder="100% Natural Ingredients"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.14em]">Sizes</h3>
                  <p className="text-[11px] text-gray-400 mt-1">Optional per-size price. Expand to set bulk tiers.</p>
                </div>
                <button
                  type="button"
                  onClick={addSize}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold bg-gray-900 text-white rounded-md hover:bg-gray-800 transition"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.sizes.map((size, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Size header row */}
                    <div className="p-2.5 bg-gray-50/60 space-y-2">
                      <div className="flex gap-1.5 items-center">
                        <button
                          type="button"
                          onClick={() => toggleSizeExpand(index)}
                          className="p-1 text-gray-400 hover:text-gray-700 hover:bg-white rounded transition flex-shrink-0"
                          aria-label={expandedSizes[index] ? 'Collapse' : 'Expand'}
                        >
                          {expandedSizes[index] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        <input
                          type="text"
                          value={size.label}
                          onChange={(e) => updateSize(index, 'label', e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/15 transition-colors"
                          placeholder="Label (Small 30-40g)"
                        />
                        <input
                          type="text"
                          value={size.value}
                          onChange={(e) => updateSize(index, 'value', e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/15 transition-colors"
                          placeholder="Value (small-30-40g)"
                        />
                        <button
                          type="button"
                          onClick={() => removeSize(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition flex-shrink-0"
                          aria-label="Remove size"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex gap-1.5 items-center pl-7">
                        <div className="flex-1 relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none">Sale £</span>
                          <input
                            type="number" step="0.01" min="0"
                            value={size.price}
                            onChange={(e) => updateSize(index, 'price', e.target.value)}
                            className="w-full pl-12 pr-2 py-1 border border-gray-200 rounded text-xs bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/15 transition-colors"
                            placeholder="—"
                          />
                        </div>
                        <div className="flex-1 relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 pointer-events-none">Orig £</span>
                          <input
                            type="number" step="0.01" min="0"
                            value={size.originalPrice}
                            onChange={(e) => updateSize(index, 'originalPrice', e.target.value)}
                            className="w-full pl-12 pr-2 py-1 border border-gray-200 rounded text-xs bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/15 transition-colors"
                            placeholder="—"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expanded: Bulk Tiers + Stock per size */}
                    {expandedSizes[index] && (
                      <div className="p-3 border-t border-gray-100 bg-white space-y-3">
                        {/* Bulk Pricing Tiers */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.14em]">Bulk tiers</h4>
                            <button
                              type="button"
                              onClick={() => addBulkTierToSize(index)}
                              className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold bg-gray-900 text-white rounded-md hover:bg-gray-800 transition"
                            >
                              <Plus className="w-3 h-3" />
                              Add
                            </button>
                          </div>
                          {(size.bulkTiers || []).length > 0 && (
                            <div className="space-y-1.5">
                              <div className="grid grid-cols-[1fr_1fr_1fr_1fr_24px] gap-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1">
                                <span>Min</span>
                                <span>Sale £</span>
                                <span>Orig £</span>
                                <span>Disc %</span>
                                <span></span>
                              </div>
                              {(size.bulkTiers || []).map((tier: any, tIdx: number) => (
                                <div key={tIdx} className="grid grid-cols-[1fr_1fr_1fr_1fr_24px] gap-1.5 items-center">
                                  <input
                                    type="number"
                                    min="1"
                                    value={tier.minQty}
                                    onChange={(e) => updateBulkTier(index, tIdx, 'minQty', e.target.value)}
                                    className="px-1.5 py-1 border border-gray-200 rounded text-xs bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/15 transition-colors min-w-0"
                                    placeholder="e.g. 3"
                                  />
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={tier.salePrice}
                                    onChange={(e) => updateBulkTier(index, tIdx, 'salePrice', e.target.value)}
                                    className="px-1.5 py-1 border border-gray-200 rounded text-xs bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/15 transition-colors min-w-0"
                                    placeholder="3.99"
                                  />
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={tier.originalPrice}
                                    onChange={(e) => updateBulkTier(index, tIdx, 'originalPrice', e.target.value)}
                                    className="px-1.5 py-1 border border-gray-200 rounded text-xs bg-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/15 transition-colors min-w-0"
                                    placeholder="5.99"
                                  />
                                  <input
                                    type="number"
                                    value={tier.discountPercent}
                                    readOnly
                                    className="px-1.5 py-1 border border-gray-100 rounded bg-gray-50 text-xs text-gray-500 min-w-0"
                                    placeholder="Auto"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeBulkTier(index, tIdx)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded transition flex-shrink-0"
                                    aria-label="Remove tier"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          {(size.bulkTiers || []).length === 0 && (
                            <p className="text-[11px] text-gray-400 italic">No bulk tiers yet.</p>
                          )}
                        </div>

                        {/* Per-size stock (only visible when trackStock is on) */}
                        {formData.trackStock && (
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.14em] mb-1.5">Stock quantity</label>
                            <input
                              type="number"
                              min="0"
                              value={size.stockQuantity}
                              onChange={(e) => updateSize(index, 'stockQuantity', e.target.value)}
                              className="w-24 px-2 py-1 border border-gray-200 rounded text-xs bg-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/15 transition-colors"
                              placeholder="0"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.14em]">Global bulk pricing</h3>
                  <p className="text-[11px] text-gray-400 mt-1">Applies when product has no sizes.</p>
                </div>
                <button
                  type="button"
                  onClick={addBulkPrice}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold bg-gray-900 text-white rounded-md hover:bg-gray-800 transition"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>
              <div className="space-y-3">
                {formData.bulkPricing.map((pricing, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="number"
                      value={pricing.quantity}
                      onChange={(e) => updateBulkPrice(index, 'quantity', e.target.value)}
                      className="w-24 px-2.5 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-colors"
                      placeholder="Qty"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={pricing.price}
                      onChange={(e) => updateBulkPrice(index, 'price', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-colors"
                      placeholder="Price"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={pricing.originalPrice}
                      onChange={(e) => updateBulkPrice(index, 'originalPrice', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-colors"
                      placeholder="Original"
                    />
                    <input
                      type="number"
                      value={pricing.discount}
                      onChange={(e) => updateBulkPrice(index, 'discount', e.target.value)}
                      className="w-24 px-2.5 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-colors"
                      placeholder="Disc %"
                    />
                    <button
                      type="button"
                      onClick={() => removeBulkPrice(index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock Management */}
            <div className="border-t border-gray-100 pt-6">
              <div className="bg-emerald-50/40 rounded-xl p-4 border border-emerald-100">
                <h3 className="text-[10px] font-bold text-emerald-700 uppercase tracking-[0.14em] mb-1">Stock management</h3>
                <p className="text-[11px] text-gray-500 mb-4">Enable tracking to prevent overselling.</p>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">Track stock</p>
                    <p className="text-[11px] text-gray-500">Prevent overselling</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, trackStock: !prev.trackStock }))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      formData.trackStock ? 'bg-emerald-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        formData.trackStock ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {formData.trackStock && (
                  <div className="bg-white rounded-md p-3 border border-emerald-100">
                    {formData.sizes.some((s) => s.label && s.value) ? (
                      <div>
                        <p className="text-[11px] font-medium text-gray-600 mb-2">Per size (expand to edit)</p>
                        <div className="space-y-1">
                          {formData.sizes.filter((s) => s.label && s.value).map((s, i) => (
                            <div key={i} className="flex items-center justify-between bg-gray-50 rounded px-2.5 py-1.5">
                              <span className="text-xs text-gray-700 font-medium">{s.label || s.value}</span>
                              <span className="text-xs font-bold text-emerald-700 tabular-nums">{s.stockQuantity || 0} units</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Global Stock Quantity</label>
                        <input
                          type="number"
                          name="stockQuantity"
                          value={formData.stockQuantity}
                          onChange={handleChange}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-colors"
                          placeholder="e.g. 100"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Pricing Settings */}
            <div className="border-t border-gray-100 pt-6">
              <div className="bg-violet-50/40 rounded-xl p-4 border border-violet-100">
                <h3 className="text-[10px] font-bold text-violet-700 uppercase tracking-[0.14em] mb-1">Advanced pricing</h3>
                <p className="text-[11px] text-gray-500 mb-4">Tax, delivery, subscription options.</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Tax Percentage (%)</label>
                    <input
                      type="number"
                      name="taxPercentage"
                      value={formData.taxPercentage}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 transition-colors"
                      placeholder="e.g. 20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Delivery Charge (£)</label>
                    <input
                      type="number"
                      name="deliveryCharge"
                      value={formData.deliveryCharge}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 transition-colors"
                      placeholder="e.g. 2.99"
                    />
                  </div>
                </div>

                {/* Subscription Toggle */}
                <div className="border-t border-violet-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Subscribe &amp; Save</p>
                      <p className="text-[11px] text-gray-500">Recurring deliveries at a discount</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, subscriptionEnabled: !prev.subscriptionEnabled }))}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        formData.subscriptionEnabled ? 'bg-violet-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          formData.subscriptionEnabled ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {formData.subscriptionEnabled && (
                    <div className="space-y-3 bg-white rounded-md p-3 border border-violet-100">
                      {/* Discount */}
                      <div>
                        <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Discount (%)</label>
                        <input
                          type="number"
                          name="subscriptionDiscount"
                          value={formData.subscriptionDiscount}
                          onChange={handleChange}
                          min="0"
                          max="100"
                          step="1"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 transition-colors"
                          placeholder="e.g. 25"
                        />
                      </div>

                      {/* Weekly Options */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.14em] mb-1.5">Weekly options</label>
                        <div className="flex gap-1.5 mb-2">
                          <input
                            type="number"
                            min="1"
                            value={weekInput}
                            onChange={(e) => setWeekInput(e.target.value)}
                            placeholder="2"
                            className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-md text-sm bg-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/15 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const n = parseInt(weekInput);
                              if (n > 0 && !formData.weeklyOptions.includes(n)) {
                                setFormData(prev => ({ ...prev, weeklyOptions: [...prev.weeklyOptions, n].sort((a, b) => a - b) }));
                              }
                              setWeekInput('');
                            }}
                            className="px-2.5 py-1.5 bg-violet-600 text-white rounded-md text-xs font-semibold hover:bg-violet-700"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {formData.weeklyOptions.map((n) => (
                            <span key={n} className="inline-flex items-center gap-1 bg-violet-50 border border-violet-200 text-violet-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                              {n}w
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, weeklyOptions: prev.weeklyOptions.filter(w => w !== n) }))}
                                className="text-violet-400 hover:text-violet-700 font-bold leading-none"
                                aria-label={`Remove ${n} week option`}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          {formData.weeklyOptions.length === 0 && (
                            <span className="text-[11px] text-gray-400 italic">None added</span>
                          )}
                        </div>
                      </div>

                      {/* Monthly Options */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.14em] mb-1.5">Monthly options</label>
                        <div className="flex gap-1.5 mb-2">
                          <input
                            type="number"
                            min="1"
                            value={monthInput}
                            onChange={(e) => setMonthInput(e.target.value)}
                            placeholder="1"
                            className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-md text-sm bg-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/15 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const n = parseInt(monthInput);
                              if (n > 0 && !formData.monthlyOptions.includes(n)) {
                                setFormData(prev => ({ ...prev, monthlyOptions: [...prev.monthlyOptions, n].sort((a, b) => a - b) }));
                              }
                              setMonthInput('');
                            }}
                            className="px-2.5 py-1.5 bg-violet-600 text-white rounded-md text-xs font-semibold hover:bg-violet-700"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {formData.monthlyOptions.map((n) => (
                            <span key={n} className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                              {n}m
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, monthlyOptions: prev.monthlyOptions.filter(m => m !== n) }))}
                                className="text-blue-400 hover:text-blue-700 font-bold leading-none"
                                aria-label={`Remove ${n} month option`}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          {formData.monthlyOptions.length === 0 && (
                            <span className="text-[11px] text-gray-400 italic">None added</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {editingProduct ? 'Updating…' : 'Creating…'}
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  {editingProduct ? 'Save changes' : 'Create product'}
                </>
              )}
            </button>
          </div>{/* /space-y-7 */}
          </div>{/* /p-6 body */}
        </div>{/* /bg-white form card */}
      </div>{/* /max-w-5xl form wrapper */}

      {/* Slide-out product list drawer */}
      {showListDrawer && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setShowListDrawer(false)} />
      )}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100 transform transition-transform duration-300 ease-out ${
          showListDrawer ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
          <div className="bg-white">
            <header className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-amber-50 to-white border-b border-gray-100 gap-3">
              <div className="flex items-center gap-2.5">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${showArchivedView ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'}`}>
                  {showArchivedView ? 'Archived' : 'Active'}
                </span>
                <span className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700 tabular-nums">
                    {showArchivedView ? archivedProducts.length : products.length}
                  </span>{' '}
                  {(showArchivedView ? archivedProducts.length : products.length) === 1 ? 'product' : 'products'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowListDrawer(false)}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </header>
            <div className="px-5 py-3 border-b border-gray-100">
              <div className="relative w-full">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                <input
                  type="text"
                  placeholder="Search…"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {showArchivedView ? (
              loadingArchived ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : archivedProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No archived products</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {archivedProducts.map((product) => (
                    <li
                      key={product._id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50/30 transition-colors"
                    >
                      <img
                        src={product.image as string}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-md border border-gray-100 flex-shrink-0 opacity-60"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700 truncate">{product.name}</p>
                        <div className="flex items-center flex-wrap gap-1.5 mt-1">
                          {product.productType && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                              {product.productType as string}
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded">Archived</span>
                          <span className="text-xs font-bold text-gray-500 tabular-nums">£{product.price as number}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRestoreProduct(product)}
                        title="Restore"
                        className="p-2 rounded-lg border border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50 transition-colors flex-shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )
            ) : loadingProducts ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">{products.length === 0 ? 'No products yet' : 'No products match the search'}</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {filteredProducts.map((product) => (
                  <li
                    key={product._id}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-amber-50/30 transition-colors ${
                      editingProduct?._id === product._id ? 'bg-amber-50' : ''
                    }`}
                  >
                    <img
                      src={product.image as string}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-md border border-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{product.description as string}</p>
                      <div className="flex items-center flex-wrap gap-1.5 mt-1">
                        {product.productType && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                            {product.productType as string}
                          </span>
                        )}
                        {product.variety && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded">
                            {typeof product.variety === 'object' ? (product.variety.name || product.variety.category) : product.variety}
                          </span>
                        )}
                        <span className="text-xs font-bold text-gray-900 tabular-nums">£{product.price as number}</span>
                        {product.originalPrice as number > 0 && (
                          <span className="text-[11px] text-gray-400 line-through tabular-nums">£{product.originalPrice as number}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                        title="Edit"
                        className="p-2 rounded-lg border border-gray-200 bg-white text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(product)}
                        title="Archive"
                        className="p-2 rounded-lg border border-orange-200 bg-white text-orange-600 hover:bg-orange-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
      </aside>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteModal(false)} />

          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Archive Product</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Archive <span className="font-semibold">{productToDelete?.name}</span>?
                  It will be hidden from all listings but can be restored later.
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
                className="flex-1 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition disabled:opacity-60"
              >
                {loading ? 'Archiving...' : 'Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDashboard;

'use client';

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
  X,
  Upload,
  Trash2,
  Save,
  Edit2,
  Package,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Eye,
  EyeOff,
  Plus,
  Tag,
} from 'lucide-react';

const VarietyDashboard = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    displayOrder: '0',
  });

  interface VarietyItem {
    _id: string;
    name: string;
    category: string;
    description?: string;
    image?: string;
    displayOrder?: number;
    isActive?: boolean;
    [key: string]: unknown;
  }

  interface CategoryItem {
    _id: string;
    name: string;
    [key: string]: unknown;
  }

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Varieties sidebar state
  const [varieties, setVarieties] = useState<VarietyItem[]>([]);
  const [loadingVarieties, setLoadingVarieties] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [editingVariety, setEditingVariety] = useState<VarietyItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [varietyToDelete, setVarietyToDelete] = useState<VarietyItem | null>(null);

  // Categories state
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryMessage, setCategoryMessage] = useState({ type: '', text: '' });

  // Debug state
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    fetchVarieties();
    fetchCategories();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

  const fetchVarieties = async () => {
    try {
      setLoadingVarieties(true);
      const response = await fetch(`${API_BASE}/variety`);
      const result = await response.json();
      if (result.success) setVarieties(result.data || []);
    } catch (error) {
      console.error('Error fetching varieties:', error);
      setDebugInfo(`Fetch Error: ${error.message}`);
    } finally {
      setLoadingVarieties(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch(`${API_BASE}/categories`);
      const result = await response.json();
      if (result.success) {
        const cats = result.data || [];
        setCategories(cats);
        // Set default category to first available if current is empty
        if (!formData.category && cats.length > 0) {
          setFormData((prev) => ({ ...prev, category: cats[0].name }));
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      setCategoryLoading(true);
      setCategoryMessage({ type: '', text: '' });
      const token = Cookies.get('token');

      const response = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setCategoryMessage({ type: 'success', text: 'Category added!' });
        setNewCategoryName('');
        fetchCategories();
        setTimeout(() => setCategoryMessage({ type: '', text: '' }), 2000);
      } else {
        setCategoryMessage({ type: 'error', text: result.message || 'Failed to add category' });
      }
    } catch (error) {
      setCategoryMessage({ type: 'error', text: `Error: ${error.message}` });
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      setCategoryLoading(true);
      setCategoryMessage({ type: '', text: '' });
      const token = Cookies.get('token');

      const response = await fetch(`${API_BASE}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setCategoryMessage({ type: 'success', text: 'Category deleted!' });
        fetchCategories();
        setTimeout(() => setCategoryMessage({ type: '', text: '' }), 2000);
      } else {
        setCategoryMessage({ type: 'error', text: result.message || 'Failed to delete category' });
      }
    } catch (error) {
      setCategoryMessage({ type: 'error', text: `Error: ${error.message}` });
    } finally {
      setCategoryLoading(false);
    }
  };

  // Check if a category is in use by any variety
  const isCategoryInUse = (categoryName) => {
    return varieties.some((v) => v.category === categoryName);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEdit = (variety) => {
    setEditingVariety(variety);
    setFormData({
      name: variety.name || '',
      description: variety.description || '',
      category: variety.category || '',
      displayOrder: (variety.displayOrder ?? 0).toString(),
    });
    setImage(null);
    setImagePreview(variety.image || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingVariety(null);
    setFormData({
      name: '',
      description: '',
      category: categories.length > 0 ? categories[0].name : '',
      displayOrder: '0',
    });
    setImage(null);
    setImagePreview(null);
    setMessage({ type: '', text: '' });
    setDebugInfo('');
  };

  const handleDeleteClick = (variety) => {
    setVarietyToDelete(variety);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!varietyToDelete?._id) return;

    try {
      setLoading(true);
      const token = Cookies.get('token');

      const response = await fetch(`${API_BASE}/variety/${varietyToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Variety deleted successfully!' });
        setShowDeleteModal(false);
        setVarietyToDelete(null);
        if (editingVariety?._id === varietyToDelete._id) handleCancelEdit();
        fetchVarieties();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to delete variety' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while deleting' });
    } finally {
      setLoading(false);
    }
  };

  const toggleVarietyStatus = async (varietyId) => {
    try {
      const token = Cookies.get('token');
      const response = await fetch(`${API_BASE}/variety/${varietyId}/toggle-status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ type: 'success', text: 'Variety status updated!' });
        fetchVarieties();
        setTimeout(() => setMessage({ type: '', text: '' }), 2000);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update status' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating status' });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    setDebugInfo('Starting submission...');

    try {
      const formDataToSend = new FormData();

      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('displayOrder', formData.displayOrder);

      if (image) {
        formDataToSend.append('image', image);
      }

      const url = editingVariety
        ? `${API_BASE}/variety/${editingVariety._id}`
        : `${API_BASE}/variety`;

      const method = editingVariety ? 'PUT' : 'POST';

      setDebugInfo(`Sending ${method} to ${url}...`);

      const token = Cookies.get('token');
      const response = await fetch(url, {
        method,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formDataToSend,
      });

      setDebugInfo(`Response status: ${response.status}`);

      const responseText = await response.text();

      try {
        const result = JSON.parse(responseText);

        if (response.ok && result.success) {
          setMessage({
            type: 'success',
            text: editingVariety ? 'Variety updated successfully!' : 'Variety created successfully!',
          });

          setTimeout(() => setMessage({ type: '', text: '' }), 3000);
          handleCancelEdit();
          fetchVarieties();
        } else {
          setMessage({
            type: 'error',
            text: result.message || result.error || 'Failed to save variety',
          });
          setDebugInfo(`Error: ${result.message}`);
        }
      } catch (parseError) {
        setMessage({
          type: 'error',
          text: `Server returned non-JSON: ${responseText.substring(0, 100)}`,
        });
        setDebugInfo(`Parse error: ${parseError.message}`);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Network error: ${error.message}`,
      });
      setDebugInfo(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 relative">
      <button
        type="button"
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed top-24 right-4 z-50 bg-purple-500 text-white p-3 rounded-full shadow-lg hover:bg-purple-600 transition"
      >
        {showSidebar ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              {editingVariety ? 'Edit Variety' : 'Add New Variety'}
            </h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition flex items-center gap-1"
              >
                <Tag className="w-4 h-4" />
                Manage Categories
              </button>
              {editingVariety && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          {/* Debug Info */}
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
            {/* Basic Information */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Variety Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Blueberry Yak Chews"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  {loadingCategories ? (
                    <div className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-400">
                      Loading categories...
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="w-full px-4 py-2 border border-orange-300 bg-orange-50 rounded-lg text-orange-700 text-sm">
                      No categories found.{' '}
                      <button
                        type="button"
                        onClick={() => setShowCategoryModal(true)}
                        className="underline font-medium"
                      >
                        Add one first
                      </button>
                    </div>
                  ) : (
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Delicious blueberry flavored yak milk chews..."
                  />
                </div>
              </div>
            </div>

            {/* Variety Image */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Variety Image {!editingVariety && '*'}
              </h2>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload variety image</p>
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

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {editingVariety ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {editingVariety ? 'Update Variety' : 'Create Variety'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Varieties Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl transition-transform duration-300 z-40 ${
          showSidebar ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '320px' }}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <h2 className="text-lg font-bold">Varieties ({varieties.length})</h2>
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
            {loadingVarieties ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : varieties.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No varieties yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {varieties.map((variety) => (
                  <div
                    key={variety._id}
                    className={`rounded-lg p-3 hover:shadow-md transition border ${
                      variety.isActive ? 'bg-gray-50 border-gray-200' : 'bg-gray-100 border-gray-300 opacity-60'
                    }`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={variety.image}
                        alt={variety.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-sm text-gray-800 truncate">{variety.name}</h3>
                          <button
                            type="button"
                            onClick={() => toggleVarietyStatus(variety._id)}
                            className="flex-shrink-0"
                            title={variety.isActive ? 'Hide variety' : 'Show variety'}
                          >
                            {variety.isActive ? (
                              <Eye className="w-4 h-4 text-green-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 truncate">{variety.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                            {variety.category}
                          </span>
                          <span className="text-xs text-gray-500">Order: {variety.displayOrder}</span>
                        </div>

                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(variety)}
                            className="flex-1 py-1 px-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center justify-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteClick(variety)}
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
              onClick={fetchVarieties}
              className="w-full py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Refresh List
            </button>
          </div>
        </div>
      </div>

      {/* Delete Variety Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteModal(false)} />

          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Delete Variety</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold">{varietyToDelete?.name}</span>?
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

      {/* Manage Categories Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCategoryModal(false)} />

          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-600" />
                Manage Categories
              </h3>
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100"
                onClick={() => setShowCategoryModal(false)}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {categoryMessage.text && (
              <div
                className={`mb-4 p-3 rounded-lg text-sm ${
                  categoryMessage.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {categoryMessage.text}
              </div>
            )}

            {/* Add new category */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                placeholder="New category name..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={categoryLoading || !newCategoryName.trim()}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Categories list */}
            <div className="max-h-64 overflow-y-auto">
              {loadingCategories ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : categories.length === 0 ? (
                <p className="text-center py-8 text-gray-500 text-sm">No categories yet. Add one above.</p>
              ) : (
                <div className="space-y-2">
                  {categories.map((cat) => {
                    const inUse = isCategoryInUse(cat.name);
                    return (
                      <div
                        key={cat._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div>
                          <span className="font-medium text-gray-800">{cat.name}</span>
                          {inUse && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                              In use
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat._id)}
                          disabled={categoryLoading || inUse}
                          title={inUse ? 'Cannot delete: category is in use by a variety' : 'Delete category'}
                          className={`p-1.5 rounded-lg transition ${
                            inUse
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-red-500 hover:bg-red-50 hover:text-red-700'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="w-full py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VarietyDashboard;

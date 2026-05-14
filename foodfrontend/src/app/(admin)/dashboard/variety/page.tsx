'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import {
  X, Upload, Trash2, Save, Edit2, Package,
  AlertCircle, Eye, EyeOff, Plus, Tag, Check, Loader2,
} from 'lucide-react';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

interface VarietyItem {
  _id: string;
  name: string;
  category: string;
  description?: string;
  image?: string;
  displayOrder?: number;
  isActive?: boolean;
}

interface CategoryItem {
  _id: string;
  name: string;
}

const emptyForm = { name: '', description: '', category: '', displayOrder: '0' };

function initials(s: string): string {
  return s.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?';
}

export default function VarietyDashboard() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

  const [formData, setFormData] = useState(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [varieties, setVarieties] = useState<VarietyItem[]>([]);
  const [loadingVarieties, setLoadingVarieties] = useState(true);
  const [editingVariety, setEditingVariety] = useState<VarietyItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VarietyItem | null>(null);
  const [search, setSearch] = useState('');

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryMessage, setCategoryMessage] = useState({ type: '', text: '' });

  const fetchVarieties = useCallback(async () => {
    try {
      setLoadingVarieties(true);
      const res = await fetch(`${API_BASE}/variety`);
      const result = await res.json();
      if (result.success) setVarieties(result.data || []);
    } catch (err) {
      console.error('Error fetching varieties:', err);
    } finally {
      setLoadingVarieties(false);
    }
  }, [API_BASE]);

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch(`${API_BASE}/categories`);
      const result = await res.json();
      if (result.success) {
        const cats = result.data || [];
        setCategories(cats);
        setFormData(prev => prev.category || cats.length === 0 ? prev : { ...prev, category: cats[0].name });
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchVarieties();
    fetchCategories();
  }, [fetchVarieties, fetchCategories]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      setCategoryLoading(true);
      setCategoryMessage({ type: '', text: '' });
      const token = Cookies.get('token');
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setCategoryMessage({ type: 'success', text: 'Category added!' });
        setNewCategoryName('');
        fetchCategories();
        setTimeout(() => setCategoryMessage({ type: '', text: '' }), 2000);
      } else {
        setCategoryMessage({ type: 'error', text: result.message || 'Failed to add category' });
      }
    } catch (err) {
      setCategoryMessage({ type: 'error', text: `Error: ${err instanceof Error ? err.message : 'unknown'}` });
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setCategoryLoading(true);
      setCategoryMessage({ type: '', text: '' });
      const token = Cookies.get('token');
      const res = await fetch(`${API_BASE}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setCategoryMessage({ type: 'success', text: 'Category deleted!' });
        fetchCategories();
        setTimeout(() => setCategoryMessage({ type: '', text: '' }), 2000);
      } else {
        setCategoryMessage({ type: 'error', text: result.message || 'Failed to delete category' });
      }
    } catch (err) {
      setCategoryMessage({ type: 'error', text: `Error: ${err instanceof Error ? err.message : 'unknown'}` });
    } finally {
      setCategoryLoading(false);
    }
  };

  const isCategoryInUse = (categoryName: string) => varieties.some(v => v.category === categoryName);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEdit = (variety: VarietyItem) => {
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
    setFormData({ ...emptyForm, category: categories[0]?.name || '' });
    setImage(null);
    setImagePreview(null);
    setMessage({ type: '', text: '' });
  };

  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const res = await fetch(`${API_BASE}/variety/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setMessage({ type: 'success', text: 'Variety deleted!' });
        if (editingVariety?._id === deleteTarget._id) handleCancelEdit();
        setVarieties(prev => prev.filter(v => v._id !== deleteTarget._id));
        setDeleteTarget(null);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to delete' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error during delete' });
    } finally {
      setLoading(false);
    }
  };

  const toggleVarietyStatus = async (varietyId: string) => {
    try {
      const token = Cookies.get('token');
      const res = await fetch(`${API_BASE}/variety/${varietyId}/toggle-status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setVarieties(prev => prev.map(v => v._id === varietyId ? { ...v, isActive: !v.isActive } : v));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const fd = new FormData();
      fd.append('name', formData.name.trim());
      fd.append('description', formData.description.trim());
      fd.append('category', formData.category);
      fd.append('displayOrder', formData.displayOrder);
      if (image) fd.append('image', image);

      const url = editingVariety ? `${API_BASE}/variety/${editingVariety._id}` : `${API_BASE}/variety`;
      const method = editingVariety ? 'PUT' : 'POST';

      const token = Cookies.get('token');
      const res = await fetch(url, {
        method,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const result = await res.json();

      if (res.ok && result.success) {
        setMessage({ type: 'success', text: editingVariety ? 'Variety updated!' : 'Variety created!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        handleCancelEdit();
        fetchVarieties();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to save' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: `Network error: ${err instanceof Error ? err.message : 'unknown'}` });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return varieties;
    const q = search.toLowerCase();
    return varieties.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      (v.description?.toLowerCase().includes(q) ?? false)
    );
  }, [varieties, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, VarietyItem[]>();
    for (const v of filtered) {
      const key = v.category || 'Uncategorised';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="p-5 md:p-7 min-h-screen bg-[#f5f7fa]">

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors">
            <FiArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              Varieties
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {editingVariety ? `Editing ${editingVariety.name}` : 'Product varieties — grouped by category'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <Tag className="w-4 h-4" />
            Categories
          </button>
          <button
            onClick={fetchVarieties}
            className="flex items-center gap-2 px-4 py-2 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors"
          >
            <FiRefreshCw size={14} className={loadingVarieties ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Form column */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">{editingVariety ? 'Edit Variety' : 'Add Variety'}</h2>
              {editingVariety && (
                <button type="button" onClick={handleCancelEdit} className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                  Cancel
                </button>
              )}
            </div>

            {message.text && (
              <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Name *</label>
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange} required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm"
                  placeholder="Blueberry Yak Chews"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Category *</label>
                  {loadingCategories ? (
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-400">Loading…</div>
                  ) : categories.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => setShowCategoryModal(true)}
                      className="w-full px-3 py-2 border border-amber-300 bg-amber-50 rounded-lg text-amber-700 text-xs text-left hover:bg-amber-100"
                    >
                      Add a category first
                    </button>
                  ) : (
                    <select
                      name="category" value={formData.category} onChange={handleChange} required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm"
                    >
                      {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Display Order</label>
                  <input
                    type="number" name="displayOrder" value={formData.displayOrder} onChange={handleChange} min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Description *</label>
                <textarea
                  name="description" value={formData.description} onChange={handleChange} required rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm resize-none"
                  placeholder="Delicious blueberry flavored yak milk chews…"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Image {!editingVariety && <span className="text-red-500">*</span>}
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 text-center hover:border-amber-400 hover:bg-amber-50 transition bg-gray-50">
                      <Upload className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                      <p className="text-xs text-gray-600">Upload image</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  {imagePreview && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImage(null); setImagePreview(null); }}
                        className="absolute top-0.5 right-0.5 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition disabled:opacity-50 text-sm"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />{editingVariety ? 'Updating…' : 'Creating…'}</>
                ) : (
                  <><Save className="w-4 h-4" />{editingVariety ? 'Update Variety' : 'Create Variety'}</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* List column */}
        <div className="xl:col-span-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-xs text-gray-500">
              <span className="font-semibold text-gray-700 tabular-nums">{filtered.length}</span> of <span className="font-semibold text-gray-700 tabular-nums">{varieties.length}</span> {varieties.length === 1 ? 'variety' : 'varieties'}
            </span>
            <input
              type="text"
              placeholder="Search varieties…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none bg-white w-56"
            />
          </div>

          {loadingVarieties ? (
            <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Loading varieties…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
              <Package className="w-7 h-7 text-gray-300" />
              <p className="text-sm text-gray-400 font-medium">No varieties found</p>
            </div>
          ) : (
            <div className="space-y-5">
              {grouped.map(([category, items]) => (
                <section key={category} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <header className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-amber-50 to-white border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">{category}</span>
                      <span className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-700 tabular-nums">{items.length}</span> {items.length === 1 ? 'variety' : 'varieties'}
                      </span>
                    </div>
                  </header>
                  <ul className="divide-y divide-gray-50">
                    {items.map(variety => (
                      <li
                        key={variety._id}
                        className={`flex items-center gap-4 px-5 py-3 hover:bg-amber-50/30 transition-colors ${
                          variety.isActive === false ? 'opacity-60' : ''
                        } ${editingVariety?._id === variety._id ? 'bg-amber-50' : ''}`}
                      >
                        {variety.image ? (
                          <img src={variety.image} alt={variety.name} className="w-12 h-12 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 text-[11px] font-bold ring-1 ring-amber-200">
                            {initials(variety.name)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{variety.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{variety.description}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 tabular-nums">Order #{variety.displayOrder ?? 0}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleVarietyStatus(variety._id)}
                            title={variety.isActive ? 'Hide variety' : 'Show variety'}
                            className={`p-2 rounded-lg border transition-colors ${
                              variety.isActive
                                ? 'border-gray-200 bg-white text-gray-500 hover:bg-gray-100'
                                : 'border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {variety.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(variety)}
                            title="Edit"
                            className="p-2 rounded-lg border border-gray-200 bg-white text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(variety)}
                            title="Delete"
                            className="p-2 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="text-red-600 w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Delete variety?</h3>
                <p className="text-xs text-gray-500">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Permanently delete <span className="font-semibold">{deleteTarget.name}</span>?</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition">Cancel</button>
              <button onClick={confirmDelete} disabled={loading} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition disabled:opacity-60">
                {loading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCategoryModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-600" />
                Manage Categories
              </h3>
              <button type="button" onClick={() => setShowCategoryModal(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {categoryMessage.text && (
              <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
                categoryMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {categoryMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {categoryMessage.text}
              </div>
            )}

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                placeholder="New category name…"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={categoryLoading || !newCategoryName.trim()}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition disabled:opacity-50 flex items-center gap-1 text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {loadingCategories ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                </div>
              ) : categories.length === 0 ? (
                <p className="text-center py-8 text-gray-400 text-sm">No categories yet.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {categories.map(cat => {
                    const inUse = isCategoryInUse(cat.name);
                    return (
                      <li key={cat._id} className="flex items-center justify-between px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                          {inUse && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">In use</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat._id)}
                          disabled={categoryLoading || inUse}
                          title={inUse ? 'In use by a variety — cannot delete' : 'Delete category'}
                          className={`p-1.5 rounded-lg transition ${
                            inUse ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

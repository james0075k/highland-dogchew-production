'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import {
  Upload, Trash2, Save, Edit2, X, ChevronRight, ChevronLeft,
  AlertCircle, Check, Loader2, Image, ToggleLeft, ToggleRight,
  RefreshCw, Camera,
} from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface GalleryItem {
  _id: string;
  image: string;
  title: string;
  description: string;
  category: string;
  order: number;
  isActive: boolean;
}

const CATEGORIES = [
  'GALLERY', 'HONEY', 'PUMPKIN', 'STRAWBERRY', 'BLUEBERRY',
  'COCONUT', 'PEANUT', 'MINT', 'TURMERIC', 'FLAXSEED',
];

const emptyForm = {
  title:       '',
  description: '',
  category:    'GALLERY',
  order:       '0',
  isActive:    true,
};

/* ═══════════════════════════════════════════════════════════════════════════
   Component
═══════════════════════════════════════════════════════════════════════════ */
export default function GalleryAdminPage() {
  const router   = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

  const [formData,     setFormData]     = useState(emptyForm);
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [message,      setMessage]      = useState<{ type: string; text: string }>({ type: '', text: '' });

  const [items,         setItems]         = useState<GalleryItem[]>([]);
  const [loadingList,   setLoadingList]   = useState(true);
  const [showSidebar,   setShowSidebar]   = useState(true);
  const [editingItem,   setEditingItem]   = useState<GalleryItem | null>(null);
  const [deleteTarget,  setDeleteTarget]  = useState<GalleryItem | null>(null);
  const [filterCat,     setFilterCat]     = useState<string>('ALL');

  /* ── auth ── */
  const getToken = (): string | null =>
    Cookies.get('token') || localStorage.getItem('adminToken') || null;

  const authHeaders = (): Record<string, string> | null => {
    const token = getToken();
    if (!token) {
      setMessage({ type: 'error', text: 'Session expired. Redirecting to login…' });
      setTimeout(() => router.push('/login'), 1500);
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  };

  const handleApiError = (status: number, msg: string) => {
    if (status === 401 || status === 403) {
      Cookies.remove('token');
      localStorage.removeItem('adminToken');
      setMessage({ type: 'error', text: 'Session expired. Redirecting…' });
      setTimeout(() => router.push('/login'), 1500);
      return;
    }
    setMessage({ type: 'error', text: msg || 'Something went wrong' });
  };

  /* ── fetch list ── */
  const fetchItems = useCallback(async () => {
    const token = getToken();
    if (!token) { setLoadingList(false); return; }
    try {
      setLoadingList(true);
      const res  = await fetch(`${API_BASE}/gallery/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { handleApiError(res.status, data.message); return; }
      setItems(Array.isArray(data.data) ? data.data : []);
    } catch {
      setItems([]);
    } finally {
      setLoadingList(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchItems();
    return () => { if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview); };
  }, []);

  /* ── form helpers ── */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title:       item.title       || '',
      description: item.description || '',
      category:    item.category    || 'GALLERY',
      order:       String(item.order ?? 0),
      isActive:    item.isActive    ?? true,
    });
    setImageFile(null);
    setImagePreview(item.image || null);
    setMessage({ type: '', text: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setFormData(emptyForm);
    setImageFile(null);
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setMessage({ type: '', text: '' });
  };

  /* ── delete ── */
  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;
    const headers = authHeaders();
    if (!headers) return;
    try {
      setLoading(true);
      const res  = await fetch(`${API_BASE}/gallery/${deleteTarget._id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Photo deleted.' });
        setDeleteTarget(null);
        if (editingItem?._id === deleteTarget._id) handleCancelEdit();
        fetchItems();
      } else {
        handleApiError(res.status, data.message);
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error.' });
    } finally {
      setLoading(false);
    }
  };

  /* ── submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Title is required' });
      return;
    }
    if (!editingItem && !imageFile) {
      setMessage({ type: 'error', text: 'Please upload a photo' });
      return;
    }

    const headers = authHeaders();
    if (!headers) return;

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title',       formData.title.trim());
      fd.append('description', formData.description.trim());
      fd.append('category',    formData.category);
      fd.append('order',       formData.order);
      fd.append('isActive',    String(formData.isActive));
      if (imageFile) fd.append('image', imageFile);

      const url    = editingItem ? `${API_BASE}/gallery/${editingItem._id}` : `${API_BASE}/gallery`;
      const method = editingItem ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers, body: fd });
      const result = await res.json();

      if (res.ok) {
        setMessage({
          type: 'success',
          text: editingItem ? 'Photo updated!' : 'Photo added to gallery!',
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        handleCancelEdit();
        fetchItems();
      } else {
        handleApiError(res.status, result.message);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: `Network error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const displayedItems = filterCat === 'ALL'
    ? items
    : items.filter(i => i.category === filterCat);

  /* ── render ── */
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 relative">

      {/* Sidebar toggle */}
      <button
        type="button"
        onClick={() => setShowSidebar(s => !s)}
        className="fixed top-24 right-4 z-50 bg-gradient-to-r from-amber-500 to-orange-600 text-white p-3 rounded-full shadow-lg hover:opacity-90 transition"
      >
        {showSidebar ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      {/* ── Form ───────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">

          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Camera className="w-6 h-6 text-amber-500" />
                {editingItem ? 'Edit Gallery Photo' : 'Add Gallery Photo'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Photos added here appear on the public <strong>/gallery</strong> page
              </p>
            </div>
            {editingItem && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-1"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            )}
          </div>

          {/* Message banner */}
          {message.text && (
            <div className={`mb-5 p-4 rounded-xl flex items-center gap-2 text-sm font-medium ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success'
                ? <Check       className="w-4 h-4 flex-shrink-0" />
                : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Image upload */}
            <div className="border-b pb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-500" />
                Photo
                {!editingItem && <span className="text-red-500">*</span>}
              </h2>
              <div className="flex items-start gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-amber-400 transition bg-gray-50 hover:bg-amber-50">
                    <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                    <p className="text-sm text-gray-600">Click to upload photo</p>
                    <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP up to 10 MB</p>
                    <p className="text-xs text-gray-400 mt-0.5">Recommended: 4:3 ratio (e.g. 800×600)</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {imagePreview && (
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-amber-200 shadow flex-shrink-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="border-b pb-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-700">Photo Details</h2>

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm"
                  placeholder="e.g. Honey Flavored Chew"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={200}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm"
                  placeholder="e.g. Sweet & natural honey coating"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm bg-white"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  This controls which filter tab shows this photo on the gallery page
                </p>
              </div>

              {/* Order + Active */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Display Order</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">Lower = shown first</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Visibility</label>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition w-full ${
                      formData.isActive
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                  >
                    {formData.isActive
                      ? <><ToggleRight className="w-4 h-4" /> Visible</>
                      : <><ToggleLeft  className="w-4 h-4" /> Hidden</>}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl transition disabled:opacity-50 shadow-md"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" />{editingItem ? 'Updating…' : 'Uploading…'}</>
                : <><Save    className="w-4 h-4" />{editingItem ? 'Update Photo' : 'Add to Gallery'}</>
              }
            </button>
          </form>
        </div>
      </div>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl transition-transform duration-300 z-40 ${
          showSidebar ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '320px' }}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                <h2 className="text-base font-bold">Gallery ({items.length})</h2>
              </div>
              <button type="button" onClick={() => setShowSidebar(false)} className="hover:bg-white/20 p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category filter */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['ALL', ...CATEGORIES].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCat(cat)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition ${
                    filterCat === cat ? 'bg-white text-amber-700' : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3">
            {loadingList ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
            ) : displayedItems.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{items.length === 0 ? 'No photos yet' : 'No photos in this category'}</p>
                <p className="text-xs mt-1">Upload your first photo above</p>
              </div>
            ) : (
              <div className="space-y-2">
                {displayedItems.map(item => (
                  <div
                    key={item._id}
                    className={`rounded-xl border overflow-hidden transition ${
                      editingItem?._id === item._id
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-gray-200 bg-gray-50 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex gap-3 p-2.5">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        <div className={`absolute bottom-0 inset-x-0 text-center text-[8px] font-bold py-0.5 ${
                          item.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                        }`}>
                          {item.isActive ? 'LIVE' : 'HIDDEN'}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-800 truncate">{item.title}</p>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{item.description || '—'}</p>
                        <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 px-2.5 pb-2.5">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="flex-1 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="flex-1 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t">
            <button
              type="button"
              onClick={fetchItems}
              disabled={loadingList}
              className="w-full py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? 'animate-spin' : ''}`} />
              {loadingList ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Delete modal ─────────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Delete Gallery Photo</h3>
                <p className="text-sm text-gray-500 mt-1">
                  &ldquo;{deleteTarget.title}&rdquo; will be permanently removed. This cannot be undone.
                </p>
              </div>
              <button type="button" onClick={() => setDeleteTarget(null)} className="p-1 rounded hover:bg-gray-100 ml-auto">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</>
                  : <><Trash2  className="w-4 h-4" /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

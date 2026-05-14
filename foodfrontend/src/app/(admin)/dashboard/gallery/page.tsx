'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import {
  Upload, Trash2, Save, Edit2, X, AlertCircle, Check, Loader2,
  Image as ImageIcon, ToggleLeft, ToggleRight, Camera,
} from 'lucide-react';
import { FiArrowLeft, FiRefreshCw, FiEye, FiEyeOff, FiFilter } from 'react-icons/fi';

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
  title: '',
  description: '',
  category: 'GALLERY',
  order: '0',
  isActive: true,
};

export default function GalleryAdminPage() {
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({ type: '', text: '' });

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [filterCat, setFilterCat] = useState<string>('ALL');
  const [filterVis, setFilterVis] = useState<'all' | 'live' | 'hidden'>('all');

  const getToken = (): string | null =>
    Cookies.get('token') || (typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null);

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
      if (typeof window !== 'undefined') localStorage.removeItem('adminToken');
      setMessage({ type: 'error', text: 'Session expired. Redirecting…' });
      setTimeout(() => router.push('/login'), 1500);
      return;
    }
    setMessage({ type: 'error', text: msg || 'Something went wrong' });
  };

  const fetchItems = useCallback(async () => {
    const token = getToken();
    if (!token) { setLoadingList(false); return; }
    try {
      setLoadingList(true);
      const res = await fetch(`${API_BASE}/gallery/admin/all`, {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE]);

  useEffect(() => {
    fetchItems();
    return () => { if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'GALLERY',
      order: String(item.order ?? 0),
      isActive: item.isActive ?? true,
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

  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;
    const headers = authHeaders();
    if (!headers) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/gallery/${deleteTarget._id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Photo deleted.' });
        if (editingItem?._id === deleteTarget._id) handleCancelEdit();
        setItems(prev => prev.filter(i => i._id !== deleteTarget._id));
        setDeleteTarget(null);
      } else {
        handleApiError(res.status, data.message);
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error.' });
    } finally {
      setLoading(false);
    }
  };

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
      fd.append('title', formData.title.trim());
      fd.append('description', formData.description.trim());
      fd.append('category', formData.category);
      fd.append('order', formData.order);
      fd.append('isActive', String(formData.isActive));
      if (imageFile) fd.append('image', imageFile);

      const url = editingItem ? `${API_BASE}/gallery/${editingItem._id}` : `${API_BASE}/gallery`;
      const method = editingItem ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: fd });
      const result = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: editingItem ? 'Photo updated!' : 'Photo added to gallery!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        handleCancelEdit();
        fetchItems();
      } else {
        handleApiError(res.status, result.message);
      }
    } catch (err) {
      setMessage({ type: 'error', text: `Network error: ${err instanceof Error ? err.message : 'unknown'}` });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => items.filter(i => {
    if (filterCat !== 'ALL' && i.category !== filterCat) return false;
    if (filterVis === 'live' && !i.isActive) return false;
    if (filterVis === 'hidden' && i.isActive) return false;
    return true;
  }), [items, filterCat, filterVis]);

  const grouped = useMemo(() => {
    const map = new Map<string, GalleryItem[]>();
    for (const i of filtered) {
      if (!map.has(i.category)) map.set(i.category, []);
      map.get(i.category)!.push(i);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const counts = useMemo(() => ({
    total: items.length,
    live: items.filter(i => i.isActive).length,
    hidden: items.filter(i => !i.isActive).length,
    categories: new Set(items.map(i => i.category)).size,
  }), [items]);

  const STAT_CARDS = [
    { label: 'Total',     value: counts.total,      icon: ImageIcon, text: 'text-slate-700',  bg: 'bg-slate-50',  ring: 'ring-slate-100' },
    { label: 'Live',      value: counts.live,       icon: FiEye,     text: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
    { label: 'Hidden',    value: counts.hidden,     icon: FiEyeOff,  text: 'text-gray-600',    bg: 'bg-gray-50',     ring: 'ring-gray-100' },
    { label: 'Categories', value: counts.categories, icon: FiFilter,  text: 'text-amber-600',   bg: 'bg-amber-50',   ring: 'ring-amber-100' },
  ];

  return (
    <div className="p-5 md:p-7 min-h-screen bg-[#f5f7fa]">

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors">
            <FiArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-500" />
              Gallery
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {editingItem ? `Editing "${editingItem.title}"` : 'Photos that appear on /gallery — grouped by category'}
            </p>
          </div>
        </div>
        <button
          onClick={fetchItems}
          disabled={loadingList}
          className="flex items-center gap-2 px-4 py-2 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors disabled:opacity-60"
        >
          <FiRefreshCw size={14} className={loadingList ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {STAT_CARDS.map(card => (
          <div key={card.label} className={`bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 ring-1 ${card.ring}`}>
            <div className={`p-2 rounded-lg ${card.bg}`}><card.icon size={15} className={card.text} /></div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
              <p className={`text-lg font-bold tabular-nums ${card.text}`}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Form */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">{editingItem ? 'Edit Photo' : 'Add Photo'}</h2>
              {editingItem && (
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Photo {!editingItem && <span className="text-red-500">*</span>}
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 text-center hover:border-amber-400 hover:bg-amber-50 transition bg-gray-50">
                      <Upload className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                      <p className="text-xs text-gray-600">Upload photo</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">4:3 ratio, up to 10MB</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  {imagePreview && (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview); setImagePreview(null); }}
                        className="absolute top-0.5 right-0.5 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Title *</label>
                <input
                  type="text" name="title" value={formData.title} onChange={handleChange} required maxLength={100}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm"
                  placeholder="Honey Flavored Chew"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                <input
                  type="text" name="description" value={formData.description} onChange={handleChange} maxLength={200}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm"
                  placeholder="Sweet & natural honey coating"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Category</label>
                  <select
                    name="category" value={formData.category} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm bg-white"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Order</label>
                  <input
                    type="number" name="order" value={formData.order} onChange={handleChange} min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Visibility</label>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition w-full ${
                    formData.isActive
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}
                >
                  {formData.isActive ? <><ToggleRight className="w-4 h-4" /> Visible on gallery</> : <><ToggleLeft className="w-4 h-4" /> Hidden</>}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition disabled:opacity-50 text-sm"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />{editingItem ? 'Updating…' : 'Uploading…'}</>
                ) : (
                  <><Save className="w-4 h-4" />{editingItem ? 'Update Photo' : 'Add to Gallery'}</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Gallery grid */}
        <div className="xl:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
              <FiFilter size={13} className="text-gray-400 ml-1 flex-shrink-0" />
              {(['ALL', ...CATEGORIES]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap
                    ${filterCat === cat ? 'bg-[#0c1e35] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
              {(['all', 'live', 'hidden'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setFilterVis(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap
                    ${filterVis === v ? 'bg-[#0c1e35] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
                >
                  {v === 'all' ? 'All' : v === 'live' ? 'Live' : 'Hidden'}
                </button>
              ))}
            </div>
          </div>

          {loadingList ? (
            <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Loading photos…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
              <ImageIcon className="w-7 h-7 text-gray-300" />
              <p className="text-sm text-gray-400 font-medium">No photos found</p>
              <p className="text-[11px] text-gray-400">{items.length === 0 ? 'Upload your first photo using the form.' : 'Try adjusting the filters.'}</p>
            </div>
          ) : (
            <div className="space-y-5">
              {grouped.map(([category, photos]) => (
                <section key={category} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <header className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-amber-50 to-white border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">{category}</span>
                      <span className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-700 tabular-nums">{photos.length}</span> {photos.length === 1 ? 'photo' : 'photos'}
                      </span>
                    </div>
                  </header>
                  <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {photos.map(item => (
                      <div
                        key={item._id}
                        className={`group relative rounded-xl overflow-hidden border transition-shadow hover:shadow-md ${
                          editingItem?._id === item._id ? 'border-amber-400 ring-2 ring-amber-200' : 'border-gray-100'
                        } ${!item.isActive ? 'opacity-60' : ''}`}
                      >
                        <div className="aspect-[4/3] bg-gray-100">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>

                        <div className="absolute top-2 left-2 flex gap-1">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            item.isActive ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
                          }`}>
                            {item.isActive ? 'LIVE' : 'HIDDEN'}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black/50 text-white tabular-nums">
                            #{item.order ?? 0}
                          </span>
                        </div>

                        <div className="p-2 bg-white">
                          <p className="text-[11px] font-semibold text-gray-800 truncate">{item.title}</p>
                          <p className="text-[10px] text-gray-400 truncate">{item.description || '—'}</p>
                          <div className="flex gap-1 mt-1.5">
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              title="Edit"
                              className="flex-1 inline-flex items-center justify-center gap-1 p-1.5 rounded-lg border border-gray-200 bg-white text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              title="Delete"
                              className="flex-1 inline-flex items-center justify-center gap-1 p-1.5 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="text-red-600 w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Delete photo?</h3>
                <p className="text-xs text-gray-500">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Permanently delete &ldquo;<span className="font-semibold">{deleteTarget.title}</span>&rdquo; from the gallery?
            </p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition">Cancel</button>
              <button onClick={confirmDelete} disabled={loading} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition disabled:opacity-60">
                {loading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

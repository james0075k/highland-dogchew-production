'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import {
  Upload, Trash2, Save, Edit2, X, Loader2, Star, Quote,
  AlertCircle, Check,
} from 'lucide-react';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

interface Testimonial {
  _id: string;
  name: string;
  position?: string;
  location: string;
  rating: number;
  message: string;
  profileImage?: string;
}

const emptyForm = {
  name: '',
  position: '',
  location: '',
  rating: '5',
  message: '',
};

const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className={`w-7 h-7 transition-colors ${star <= value ? 'text-amber-400' : 'text-gray-300 hover:text-amber-300'}`}
      >
        <Star className="w-full h-full" fill={star <= value ? 'currentColor' : 'none'} />
      </button>
    ))}
  </div>
);

export default function TestimonialsAdminPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

  const [formData, setFormData] = useState(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [search, setSearch] = useState('');

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoadingList(true);
      const res = await fetch(`${API_BASE}/testimonials`);
      const data = await res.json();
      setTestimonials(Array.isArray(data) ? data : (data.data || []));
    } catch {
      console.error('Failed to fetch testimonials');
    } finally {
      setLoadingList(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchTestimonials();
    return () => {
      if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleEdit = (item: Testimonial) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      position: item.position || '',
      location: item.location || '',
      rating: String(item.rating || 5),
      message: item.message || '',
    });
    setImage(null);
    setImagePreview(item.profileImage || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setFormData(emptyForm);
    setImage(null);
    setImagePreview(null);
    setMessage({ type: '', text: '' });
  };

  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const res = await fetch(`${API_BASE}/testimonials/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Testimonial deleted!' });
        if (editingItem?._id === deleteTarget._id) handleCancelEdit();
        setTestimonials(prev => prev.filter(t => t._id !== deleteTarget._id));
        setDeleteTarget(null);
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.message || 'Delete failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error during delete' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) {
      setMessage({ type: 'error', text: 'Name and testimonial text are required' });
      return;
    }
    if (!formData.location.trim()) {
      setMessage({ type: 'error', text: 'Location is required' });
      return;
    }
    if (!editingItem && !image) {
      setMessage({ type: 'error', text: 'Please upload a profile photo' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('position', formData.position);
      fd.append('location', formData.location);
      fd.append('rating', formData.rating);
      fd.append('message', formData.message);
      if (image) fd.append('profileImage', image);

      const token = Cookies.get('token');
      const url = editingItem ? `${API_BASE}/testimonials/${editingItem._id}` : `${API_BASE}/testimonials`;
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const result = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: editingItem ? 'Testimonial updated!' : 'Testimonial added!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        handleCancelEdit();
        fetchTestimonials();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to save' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: `Network error: ${err instanceof Error ? err.message : 'unknown'}` });
    } finally {
      setLoading(false);
    }
  };

  const filtered = testimonials.filter(t => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.location.toLowerCase().includes(q) || t.message.toLowerCase().includes(q);
  });

  return (
    <div className="p-5 md:p-7 min-h-screen bg-[#f5f7fa]">

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors">
            <FiArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Quote className="w-5 h-5 text-amber-500" />
              Testimonials
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {editingItem ? `Editing testimonial from ${editingItem.name}` : 'Customer testimonials shown on the website'}
            </p>
          </div>
        </div>
        <button
          onClick={fetchTestimonials}
          className="flex items-center gap-2 px-4 py-2 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors"
        >
          <FiRefreshCw size={14} className={loadingList ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* Form column */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">
                {editingItem ? 'Edit Testimonial' : 'Add Testimonial'}
              </h2>
              {editingItem && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
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
                  Profile Photo {!editingItem && <span className="text-red-500">*</span>}
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 text-center hover:border-amber-400 hover:bg-amber-50 transition bg-gray-50">
                      <Upload className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                      <p className="text-xs text-gray-600">Upload photo</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  {imagePreview && (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-amber-200 shadow flex-shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImage(null); setImagePreview(null); }}
                        className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Name *</label>
                  <input
                    type="text" name="name" value={formData.name} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm"
                    placeholder="Sarah Johnson"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Location *</label>
                  <input
                    type="text" name="location" value={formData.location} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm"
                    placeholder="London, UK"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Position / Dog breed</label>
                <input
                  type="text" name="position" value={formData.position} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm"
                  placeholder="Golden Retriever Owner"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Rating *</label>
                <StarRating value={parseInt(formData.rating)} onChange={(v) => setFormData(prev => ({ ...prev, rating: String(v) }))} />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Testimonial *</label>
                <textarea
                  name="message" value={formData.message} onChange={handleChange} required rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm resize-none"
                  placeholder="Customer's testimonial about Highland Yak Chew…"
                />
                <p className="text-[10px] text-gray-400 mt-1">{formData.message.length} characters</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition disabled:opacity-50 text-sm"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />{editingItem ? 'Updating…' : 'Adding…'}</>
                ) : (
                  <><Save className="w-4 h-4" />{editingItem ? 'Update Testimonial' : 'Add Testimonial'}</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* List column */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <header className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-amber-50 to-white border-b border-gray-100 gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Live</span>
                <span className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700 tabular-nums">{testimonials.length}</span> {testimonials.length === 1 ? 'testimonial' : 'testimonials'}
                </span>
              </div>
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none bg-white w-48"
              />
            </header>

            {loadingList ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Quote className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No testimonials yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {filtered.map(item => (
                  <li
                    key={item._id}
                    className={`flex items-start gap-4 px-5 py-4 hover:bg-amber-50/30 transition-colors ${
                      editingItem?._id === item._id ? 'bg-amber-50' : ''
                    }`}
                  >
                    {item.profileImage ? (
                      <img
                        src={item.profileImage}
                        alt={item.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-amber-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600 font-bold">
                        {item.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                          <p className="text-[11px] text-gray-400 truncate">
                            {item.location}{item.position ? ` · ${item.position}` : ''}
                          </p>
                        </div>
                        <div className="flex flex-shrink-0">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < item.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2 leading-relaxed line-clamp-3">{item.message}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        title="Edit"
                        className="p-2 rounded-lg border border-gray-200 bg-white text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        title="Delete"
                        className="p-2 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
                <h3 className="text-lg font-bold text-gray-800">Delete testimonial?</h3>
                <p className="text-xs text-gray-500">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Permanently delete the testimonial from <span className="font-semibold">{deleteTarget.name}</span>?
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

'use client';

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
  Upload, Trash2, Save, Edit2, X, Plus, ChevronRight, ChevronLeft,
  AlertCircle, Check, Loader2, Star, Quote,
} from 'lucide-react';

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

const StarRating = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className={`w-8 h-8 transition-colors ${
          star <= value ? 'text-amber-400' : 'text-gray-300 hover:text-amber-300'
        }`}
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
  const [showSidebar, setShowSidebar] = useState(true);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Testimonial | null>(null);

  useEffect(() => {
    fetchTestimonials();
    return () => {
      if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    };
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoadingList(true);
      const res = await fetch(`${API_BASE}/testimonials`);
      const data = await res.json();
      // Backend returns array directly (not wrapped)
      setTestimonials(Array.isArray(data) ? data : (data.data || []));
    } catch {
      console.error('Failed to fetch testimonials');
    } finally {
      setLoadingList(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleDeleteClick = (item: Testimonial) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete?._id) return;
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const res = await fetch(`${API_BASE}/testimonials/${itemToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Testimonial deleted!' });
        setShowDeleteModal(false);
        setItemToDelete(null);
        if (editingItem?._id === itemToDelete._id) handleCancelEdit();
        fetchTestimonials();
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
      const url = editingItem
        ? `${API_BASE}/testimonials/${editingItem._id}`
        : `${API_BASE}/testimonials`;
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const result = await res.json();
      if (res.ok) {
        setMessage({
          type: 'success',
          text: editingItem ? 'Testimonial updated!' : 'Testimonial added!',
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        handleCancelEdit();
        fetchTestimonials();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to save' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: `Network error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 relative">
      {/* Sidebar toggle */}
      <button
        type="button"
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed top-24 right-4 z-50 bg-amber-500 text-white p-3 rounded-full shadow-lg hover:bg-amber-600 transition"
      >
        {showSidebar ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Quote className="w-6 h-6 text-amber-500" />
                {editingItem ? 'Edit Testimonial' : 'Add Testimonial'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Customer testimonials shown on the website
              </p>
            </div>
            {editingItem && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {/* Message */}
          {message.text && (
            <div
              className={`mb-5 p-4 rounded-xl flex items-center gap-2 text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <Check className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div className="border-b pb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-500" />
                Profile Photo {!editingItem && <span className="text-red-500">*</span>}
              </h2>
              <div className="flex items-start gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-amber-400 transition bg-gray-50 hover:bg-amber-50">
                    <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                    <p className="text-sm text-gray-600">Click to upload photo</p>
                    <p className="text-xs text-gray-400 mt-0.5">PNG, JPG up to 5MB</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {imagePreview && (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-amber-200 shadow flex-shrink-0">
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

            {/* Customer Info */}
            <div className="border-b pb-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-700">Customer Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    placeholder="e.g. Sarah Johnson"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Location <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    placeholder="e.g. London, UK"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Position / Dog Breed (Optional)</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    placeholder="e.g. Golden Retriever Owner"
                  />
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Rating <span className="text-red-500">*</span></label>
                <StarRating
                  value={parseInt(formData.rating)}
                  onChange={(v) => setFormData((prev) => ({ ...prev, rating: String(v) }))}
                />
              </div>
            </div>

            {/* Testimonial Text */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Testimonial Text <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm resize-none"
                placeholder="Write the customer's testimonial about the Highland Dog Chew product..."
              />
              <p className="text-xs text-gray-400 mt-1">{formData.message.length} characters</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />{editingItem ? 'Updating...' : 'Adding...'}</>
              ) : (
                <><Save className="w-4 h-4" />{editingItem ? 'Update Testimonial' : 'Add Testimonial'}</>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ─── Sidebar: Testimonials List ─── */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl transition-transform duration-300 z-40 ${
          showSidebar ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '300px' }}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Quote className="w-5 h-5" />
                <h2 className="text-base font-bold">Testimonials ({testimonials.length})</h2>
              </div>
              <button type="button" onClick={() => setShowSidebar(false)} className="hover:bg-white/20 p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {loadingList ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
            ) : testimonials.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Quote className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No testimonials yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {testimonials.map((item) => (
                  <div
                    key={item._id}
                    className={`rounded-xl p-3 border transition ${
                      editingItem?._id === item._id
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-gray-200 bg-gray-50 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex gap-2 items-start">
                      {item.profileImage ? (
                        <img
                          src={item.profileImage}
                          alt={item.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-amber-200 flex-shrink-0 mt-0.5"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-amber-500 font-bold text-sm">
                            {item.name?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{item.name}</p>
                        <p className="text-xs text-gray-400 truncate">{item.location}</p>
                        <div className="flex mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < item.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.message}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="flex-1 py-1 px-2 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(item)}
                        className="flex-1 py-1 px-2 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-1"
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
              onClick={fetchTestimonials}
              className="w-full py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Delete Testimonial</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Delete testimonial from{' '}
                  <span className="font-semibold text-gray-700">{itemToDelete?.name}</span>?
                  This cannot be undone.
                </p>
              </div>
              <button type="button" onClick={() => setShowDeleteModal(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
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
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

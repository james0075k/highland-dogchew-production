'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import {
  Upload, Trash2, Save, Edit2, X, ChevronRight, ChevronLeft,
  AlertCircle, Check, Loader2, Instagram, Film, Image, ExternalLink,
  ToggleLeft, ToggleRight, RefreshCw,
} from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────────────────── */
interface InstagramPost {
  _id: string;
  image: string;
  caption: string;
  instagramLink: string;
  type: 'photo' | 'reel' | 'video';
  order: number;
  isActive: boolean;
}

const emptyForm = {
  caption: '',
  instagramLink: '',
  type: 'photo' as 'photo' | 'reel' | 'video',
  order: '0',
  isActive: true,
};

const TYPE_OPTIONS = [
  { value: 'photo', label: 'Photo', Icon: Image },
  { value: 'reel',  label: 'Reel',  Icon: Film  },
  { value: 'video', label: 'Video', Icon: Film  },
] as const;

/* ═══════════════════════════════════════════════════════════════════════
   Component
═══════════════════════════════════════════════════════════════════════ */
export default function InstagramAdminPage() {
  const router   = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

  /* ─── form state ── */
  const [formData,     setFormData]     = useState(emptyForm);
  const [image,        setImage]        = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [message,      setMessage]      = useState<{ type: string; text: string }>({ type: '', text: '' });

  /* ─── list state ── */
  const [posts,       setPosts]       = useState<InstagramPost[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);

  /* ─── edit / delete state ── */
  const [editingItem,      setEditingItem]      = useState<InstagramPost | null>(null);
  const [showDeleteModal,  setShowDeleteModal]  = useState(false);
  const [itemToDelete,     setItemToDelete]     = useState<InstagramPost | null>(null);

  /* ─────────────────────────────────────────────────────────────────────
     Auth helpers  — checks BOTH cookies AND localStorage, same pattern
     used in settings/page.tsx
  ───────────────────────────────────────────────────────────────────── */
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

  /* ─────────────────────────────────────────────────────────────────────
     Handle auth errors from API responses
  ───────────────────────────────────────────────────────────────────── */
  const handleApiError = (status: number, msg: string) => {
    if (status === 401) {
      Cookies.remove('token');
      localStorage.removeItem('adminToken');
      setMessage({ type: 'error', text: 'Session expired. Redirecting to login…' });
      setTimeout(() => router.push('/login'), 1500);
      return;
    }
    if (status === 403) {
      setMessage({ type: 'error', text: 'Access denied. Admin privileges required.' });
      return;
    }
    setMessage({ type: 'error', text: msg || 'Something went wrong' });
  };

  /* ─────────────────────────────────────────────────────────────────────
     Fetch posts list
  ───────────────────────────────────────────────────────────────────── */
  const fetchPosts = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoadingList(false);
      setMessage({ type: 'error', text: 'Not logged in. Please log in as admin.' });
      return;
    }

    try {
      setLoadingList(true);
      const res  = await fetch(`${API_BASE}/instagram-posts/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        handleApiError(res.status, data.message);
        return;
      }

      setPosts(Array.isArray(data.data) ? data.data : []);
    } catch {
      // network error — show in sidebar, don't break the form
      setPosts([]);
    } finally {
      setLoadingList(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchPosts();
    return () => {
      if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    };
  }, []);

  /* ─────────────────────────────────────────────────────────────────────
     Form helpers
  ───────────────────────────────────────────────────────────────────── */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleEdit = (item: InstagramPost) => {
    setEditingItem(item);
    setFormData({
      caption:       item.caption       || '',
      instagramLink: item.instagramLink || '',
      type:          item.type          || 'photo',
      order:         String(item.order  ?? 0),
      isActive:      item.isActive      ?? true,
    });
    setImage(null);
    setImagePreview(item.image || null);
    setMessage({ type: '', text: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setFormData(emptyForm);
    setImage(null);
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setMessage({ type: '', text: '' });
  };

  /* ─────────────────────────────────────────────────────────────────────
     Delete
  ───────────────────────────────────────────────────────────────────── */
  const handleDeleteClick = (item: InstagramPost) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete?._id) return;
    const headers = authHeaders();
    if (!headers) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/instagram-posts/${itemToDelete._id}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Post deleted successfully!' });
        setShowDeleteModal(false);
        setItemToDelete(null);
        if (editingItem?._id === itemToDelete._id) handleCancelEdit();
        fetchPosts();
      } else {
        handleApiError(res.status, data.message);
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────────────────────────
     Submit (create / update)
  ───────────────────────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!formData.caption.trim()) {
      setMessage({ type: 'error', text: 'Caption is required' });
      return;
    }
    if (!formData.instagramLink.trim()) {
      setMessage({ type: 'error', text: 'Instagram post link is required' });
      return;
    }
    if (!editingItem && !image) {
      setMessage({ type: 'error', text: 'Please upload a post image' });
      return;
    }

    const headers = authHeaders();
    if (!headers) return;

    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('caption',       formData.caption.trim());
      fd.append('instagramLink', formData.instagramLink.trim());
      fd.append('type',          formData.type);
      fd.append('order',         formData.order);
      fd.append('isActive',      String(formData.isActive));
      if (image) fd.append('image', image);

      const url    = editingItem
        ? `${API_BASE}/instagram-posts/${editingItem._id}`
        : `${API_BASE}/instagram-posts`;
      const method = editingItem ? 'PUT' : 'POST';

      const res    = await fetch(url, { method, headers, body: fd });
      const result = await res.json();

      if (res.ok) {
        setMessage({
          type: 'success',
          text: editingItem ? 'Post updated successfully!' : 'Post added successfully!',
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 3500);
        handleCancelEdit();
        fetchPosts();
      } else {
        handleApiError(res.status, result.message);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: `Network error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  /* ════════════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 relative">

      {/* Sidebar toggle button */}
      <button
        type="button"
        onClick={() => setShowSidebar(s => !s)}
        className="fixed top-24 right-4 z-50 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-3 rounded-full shadow-lg hover:opacity-90 transition"
      >
        {showSidebar
          ? <ChevronRight className="w-5 h-5" />
          : <ChevronLeft  className="w-5 h-5" />}
      </button>

      {/* ─── Main form ─────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">

          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Instagram className="w-6 h-6 text-pink-500" />
                {editingItem ? 'Edit Instagram Post' : 'Add Instagram Post'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Posts shown on the homepage and contact page Instagram feed
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
                ? <Check        className="w-4 h-4 flex-shrink-0" />
                : <AlertCircle  className="w-4 h-4 flex-shrink-0" />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Image Upload ── */}
            <div className="border-b pb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4 text-pink-500" />
                Post Image / Thumbnail
                {!editingItem && <span className="text-red-500">*</span>}
              </h2>
              <div className="flex items-start gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-pink-400 transition bg-gray-50 hover:bg-pink-50">
                    <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                    <p className="text-sm text-gray-600">Click to upload image</p>
                    <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP up to 10 MB</p>
                    <p className="text-xs text-gray-400 mt-0.5">Use square (1:1) ratio for best display</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {imagePreview && (
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-pink-200 shadow flex-shrink-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImage(null); setImagePreview(null); }}
                      className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Post Details ── */}
            <div className="border-b pb-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-700">Post Details</h2>

              {/* Caption */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Caption <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="caption"
                  value={formData.caption}
                  onChange={handleChange}
                  required
                  rows={3}
                  maxLength={2200}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent text-sm resize-none"
                  placeholder="e.g. My pup LOVES this yak chew! Best dog treat ever 🐾 #HighlandDogchew"
                />
                <p className="text-xs text-gray-400 mt-1">{formData.caption.length} / 2 200 characters</p>
              </div>

              {/* Instagram Link */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Instagram Post Link <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    name="instagramLink"
                    value={formData.instagramLink}
                    onChange={handleChange}
                    required
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent text-sm"
                    placeholder="https://instagram.com/p/ABC123..."
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Paste the direct link to the Instagram post or reel
                </p>
              </div>

              {/* Post Type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Post Type</label>
                <div className="flex gap-2">
                  {TYPE_OPTIONS.map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: value }))}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border text-sm font-medium transition ${
                        formData.type === value
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent shadow'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
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
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent text-sm"
                    placeholder="0"
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
                      ? <><ToggleRight className="w-4 h-4" /> Active</>
                      : <><ToggleLeft  className="w-4 h-4" /> Hidden</>}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl transition disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />{editingItem ? 'Updating…' : 'Adding…'}</>
              ) : (
                <><Save className="w-4 h-4" />{editingItem ? 'Update Post' : 'Add Post'}</>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ─── Sidebar: Posts list ──────────────────────────────────────── */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl transition-transform duration-300 z-40 ${
          showSidebar ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '300px' }}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Instagram className="w-5 h-5" />
                <h2 className="text-base font-bold">Posts ({posts.length})</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSidebar(false)}
                className="hover:bg-white/20 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Posts list */}
          <div className="flex-1 overflow-y-auto p-3">
            {loadingList ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Instagram className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No posts yet</p>
                <p className="text-xs mt-1">Add your first Instagram post above</p>
              </div>
            ) : (
              <div className="space-y-2">
                {posts.map(item => (
                  <div
                    key={item._id}
                    className={`rounded-xl border transition overflow-hidden ${
                      editingItem?._id === item._id
                        ? 'border-pink-400 bg-pink-50'
                        : 'border-gray-200 bg-gray-50 hover:shadow-sm'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-square">
                      <img
                        src={item.image}
                        alt={item.caption}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute top-1.5 left-1.5 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                        item.type === 'photo' ? 'bg-blue-500' : 'bg-purple-600'
                      }`}>
                        {item.type === 'photo' ? <Image className="w-2 h-2" /> : <Film className="w-2 h-2" />}
                        {item.type.toUpperCase()}
                      </div>
                      <div className={`absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        item.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                      }`}>
                        {item.isActive ? 'LIVE' : 'HIDDEN'}
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">{item.caption}</p>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="flex-1 py-1.5 px-2 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(item)}
                          className="flex-1 py-1.5 px-2 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Refresh button */}
          <div className="p-3 border-t">
            <button
              type="button"
              onClick={fetchPosts}
              disabled={loadingList}
              className="w-full py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? 'animate-spin' : ''}`} />
              {loadingList ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Delete confirmation modal ────────────────────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Delete Instagram Post</h3>
                <p className="text-sm text-gray-500 mt-1">
                  This will permanently remove the post and its image. This cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="p-1 rounded hover:bg-gray-100 ml-auto"
              >
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

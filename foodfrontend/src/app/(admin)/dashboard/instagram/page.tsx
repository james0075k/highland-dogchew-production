'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import {
  Upload, Trash2, Save, Edit2, X, AlertCircle, Check, Loader2,
  Instagram, Film, Image as ImageIcon, ExternalLink, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { FiArrowLeft, FiRefreshCw, FiEye, FiEyeOff } from 'react-icons/fi';

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
  { value: 'photo', label: 'Photo', Icon: ImageIcon },
  { value: 'reel', label: 'Reel', Icon: Film },
  { value: 'video', label: 'Video', Icon: Film },
] as const;

export default function InstagramAdminPage() {
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

  const [formData, setFormData] = useState(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string }>({ type: '', text: '' });

  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [editingItem, setEditingItem] = useState<InstagramPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InstagramPost | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'photo' | 'reel' | 'video'>('all');

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
    if (status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined') localStorage.removeItem('adminToken');
      setMessage({ type: 'error', text: 'Session expired.' });
      setTimeout(() => router.push('/login'), 1500);
      return;
    }
    if (status === 403) { setMessage({ type: 'error', text: 'Access denied. Admin only.' }); return; }
    setMessage({ type: 'error', text: msg || 'Something went wrong' });
  };

  const fetchPosts = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoadingList(false);
      setMessage({ type: 'error', text: 'Not logged in.' });
      return;
    }
    try {
      setLoadingList(true);
      const res = await fetch(`${API_BASE}/instagram-posts/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { handleApiError(res.status, data.message); return; }
      setPosts(Array.isArray(data.data) ? data.data : []);
    } catch {
      setPosts([]);
    } finally {
      setLoadingList(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_BASE]);

  useEffect(() => {
    fetchPosts();
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
    setImage(file);
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleEdit = (item: InstagramPost) => {
    setEditingItem(item);
    setFormData({
      caption: item.caption || '',
      instagramLink: item.instagramLink || '',
      type: item.type || 'photo',
      order: String(item.order ?? 0),
      isActive: item.isActive ?? true,
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

  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;
    const headers = authHeaders();
    if (!headers) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/instagram-posts/${deleteTarget._id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Post deleted!' });
        if (editingItem?._id === deleteTarget._id) handleCancelEdit();
        setPosts(prev => prev.filter(p => p._id !== deleteTarget._id));
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

    if (!formData.caption.trim()) { setMessage({ type: 'error', text: 'Caption is required' }); return; }
    if (!formData.instagramLink.trim()) { setMessage({ type: 'error', text: 'Instagram link is required' }); return; }
    if (!editingItem && !image) { setMessage({ type: 'error', text: 'Please upload an image' }); return; }

    const headers = authHeaders();
    if (!headers) return;

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('caption', formData.caption.trim());
      fd.append('instagramLink', formData.instagramLink.trim());
      fd.append('type', formData.type);
      fd.append('order', formData.order);
      fd.append('isActive', String(formData.isActive));
      if (image) fd.append('image', image);

      const url = editingItem ? `${API_BASE}/instagram-posts/${editingItem._id}` : `${API_BASE}/instagram-posts`;
      const method = editingItem ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: fd });
      const result = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: editingItem ? 'Post updated!' : 'Post added!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3500);
        handleCancelEdit();
        fetchPosts();
      } else {
        handleApiError(res.status, result.message);
      }
    } catch (err) {
      setMessage({ type: 'error', text: `Network error: ${err instanceof Error ? err.message : 'unknown'}` });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (filterType === 'all') return posts;
    return posts.filter(p => p.type === filterType);
  }, [posts, filterType]);

  const sorted = useMemo(() =>
    [...filtered].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  [filtered]);

  const counts = useMemo(() => ({
    total: posts.length,
    live: posts.filter(p => p.isActive).length,
    photos: posts.filter(p => p.type === 'photo').length,
    reels: posts.filter(p => p.type === 'reel' || p.type === 'video').length,
  }), [posts]);

  const STAT_CARDS = [
    { label: 'Total',  value: counts.total,  icon: Instagram, text: 'text-pink-600',    bg: 'bg-pink-50',    ring: 'ring-pink-100' },
    { label: 'Live',   value: counts.live,   icon: FiEye,     text: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
    { label: 'Photos', value: counts.photos, icon: ImageIcon, text: 'text-blue-600',    bg: 'bg-blue-50',    ring: 'ring-blue-100' },
    { label: 'Reels',  value: counts.reels,  icon: Film,      text: 'text-purple-600',  bg: 'bg-purple-50',  ring: 'ring-purple-100' },
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
              <Instagram className="w-5 h-5 text-pink-500" />
              Instagram Posts
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {editingItem ? 'Editing post' : 'Shown on homepage & contact page Instagram feed'}
            </p>
          </div>
        </div>
        <button
          onClick={fetchPosts}
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
              <h2 className="text-base font-bold text-gray-900">{editingItem ? 'Edit Post' : 'Add Post'}</h2>
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
                  Image {!editingItem && <span className="text-red-500">*</span>}
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-3 text-center hover:border-pink-400 hover:bg-pink-50 transition bg-gray-50">
                      <Upload className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                      <p className="text-xs text-gray-600">Upload image</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Square (1:1) preferred</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  {imagePreview && (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImage(null); if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview); setImagePreview(null); }}
                        className="absolute top-0.5 right-0.5 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Caption *</label>
                <textarea
                  name="caption" value={formData.caption} onChange={handleChange} required rows={3} maxLength={2200}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 outline-none text-sm resize-none"
                  placeholder="My pup LOVES this yak chew! #HighlandYakChew"
                />
                <p className="text-[10px] text-gray-400 mt-1">{formData.caption.length} / 2 200</p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Instagram Link *</label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url" name="instagramLink" value={formData.instagramLink} onChange={handleChange} required
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 outline-none text-sm"
                    placeholder="https://instagram.com/p/ABC123…"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Type</label>
                <div className="flex gap-2">
                  {TYPE_OPTIONS.map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: value }))}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-xs font-medium transition ${
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Order</label>
                  <input
                    type="number" name="order" value={formData.order} onChange={handleChange} min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Visibility</label>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition w-full ${
                      formData.isActive
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                  >
                    {formData.isActive ? <><ToggleRight className="w-4 h-4" /> Active</> : <><ToggleLeft className="w-4 h-4" /> Hidden</>}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl transition disabled:opacity-50 text-sm"
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

        {/* Posts grid */}
        <div className="xl:col-span-3 space-y-4">
          <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-xl shadow-sm w-fit">
            {(['all', 'photo', 'reel', 'video'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap
                  ${filterType === t ? 'bg-[#0c1e35] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
              >
                {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {loadingList ? (
            <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Loading posts…</p>
            </div>
          ) : sorted.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3">
              <Instagram className="w-7 h-7 text-gray-300" />
              <p className="text-sm text-gray-400 font-medium">No posts found</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <header className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-pink-50 to-white border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-pink-100 text-pink-700">Feed</span>
                  <span className="text-xs text-gray-500">
                    <span className="font-semibold text-gray-700 tabular-nums">{sorted.length}</span> {sorted.length === 1 ? 'post' : 'posts'}
                  </span>
                </div>
              </header>
              <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {sorted.map(item => (
                  <div
                    key={item._id}
                    className={`group relative rounded-xl overflow-hidden border transition-shadow hover:shadow-md ${
                      editingItem?._id === item._id ? 'border-pink-400 ring-2 ring-pink-200' : 'border-gray-100'
                    } ${!item.isActive ? 'opacity-60' : ''}`}
                  >
                    <a href={item.instagramLink} target="_blank" rel="noopener noreferrer" className="block aspect-square bg-gray-100">
                      <img src={item.image} alt={item.caption} className="w-full h-full object-cover" />
                    </a>
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                        item.type === 'photo' ? 'bg-blue-500 text-white' : 'bg-purple-600 text-white'
                      }`}>
                        {item.type === 'photo' ? <ImageIcon className="w-2 h-2" /> : <Film className="w-2 h-2" />}
                        {item.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        item.isActive ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {item.isActive ? 'LIVE' : 'HIDDEN'}
                      </span>
                    </div>
                    <div className="p-2 bg-white">
                      <p className="text-[11px] text-gray-700 line-clamp-2 mb-1.5">{item.caption}</p>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          title="Edit"
                          className="flex-1 inline-flex items-center justify-center p-1.5 rounded-lg border border-gray-200 bg-white text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          title="Delete"
                          className="flex-1 inline-flex items-center justify-center p-1.5 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                <h3 className="text-lg font-bold text-gray-800">Delete Instagram post?</h3>
                <p className="text-xs text-gray-500">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Permanently remove this {deleteTarget.type} and its image.
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

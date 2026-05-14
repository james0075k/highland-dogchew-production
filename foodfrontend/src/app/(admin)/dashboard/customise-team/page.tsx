'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import {
  Upload, Trash2, Save, Edit2, Users, X, Plus,
  Phone, AlertCircle, Check, Loader2,
} from 'lucide-react';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

interface Certification {
  title: string;
  imageUrls: string;
}

interface SocialLinks {
  facebook: string;
  linkedin: string;
  twitter: string;
  github: string;
  instagram: string;
}

interface FormState {
  name: string;
  position: string;
  shortinfo: string;
  contactNumber: string;
  certifications: Certification[];
  socialLinks: SocialLinks;
}

interface Member {
  _id: string;
  name: string;
  position?: string;
  shortinfo?: string;
  contactNumber?: string;
  image?: string;
  certifications?: Certification[];
  socialLinks?: SocialLinks;
}

const emptyForm: FormState = {
  name: '',
  position: '',
  shortinfo: '',
  contactNumber: '',
  certifications: [],
  socialLinks: { facebook: '', linkedin: '', twitter: '', github: '', instagram: '' },
};

const SOCIAL_PLATFORMS: Array<keyof SocialLinks> = ['facebook', 'linkedin', 'twitter', 'github', 'instagram'];

function getAuthToken(): string | null {
  return Cookies.get('token') || (typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null) || null;
}

function initials(s: string): string {
  return s.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?';
}

export default function TeamDashboard() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';
  const router = useRouter();

  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [search, setSearch] = useState('');

  const fetchMembers = useCallback(async () => {
    try {
      setLoadingMembers(true);
      const res = await fetch(`${API_BASE}/teams`);
      const result = await res.json();
      if (result.success) setMembers(result.data || []);
    } catch (err) {
      console.error('Failed to fetch team members:', err);
    } finally {
      setLoadingMembers(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchMembers();
    return () => {
      if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (platform: keyof SocialLinks, value: string) => {
    setFormData(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [platform]: value } }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addCertification = () =>
    setFormData(prev => ({ ...prev, certifications: [...prev.certifications, { title: '', imageUrls: '' }] }));

  const updateCertification = (idx: number, field: keyof Certification, value: string) => {
    const updated = [...formData.certifications];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData(prev => ({ ...prev, certifications: updated }));
  };

  const removeCertification = (idx: number) =>
    setFormData(prev => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== idx) }));

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      position: member.position || '',
      shortinfo: member.shortinfo || '',
      contactNumber: member.contactNumber || '',
      certifications: member.certifications?.length
        ? member.certifications.map(c => ({ title: c.title || '', imageUrls: c.imageUrls || '' }))
        : [],
      socialLinks: {
        facebook: member.socialLinks?.facebook || '',
        linkedin: member.socialLinks?.linkedin || '',
        twitter: member.socialLinks?.twitter || '',
        github: member.socialLinks?.github || '',
        instagram: member.socialLinks?.instagram || '',
      },
    });
    setImage(null);
    setImagePreview(member.image || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setFormData(emptyForm);
    setImage(null);
    setImagePreview(null);
    setMessage({ type: '', text: '' });
  };

  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;
    const token = getAuthToken();
    if (!token) {
      setMessage({ type: 'error', text: 'Session expired.' });
      setDeleteTarget(null);
      setTimeout(() => router.push('/login'), 1500);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/teams/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setMessage({ type: 'success', text: 'Team member removed!' });
        if (editingMember?._id === deleteTarget._id) handleCancelEdit();
        setMembers(prev => prev.filter(m => m._id !== deleteTarget._id));
        setDeleteTarget(null);
      } else {
        setMessage({ type: 'error', text: result.message || 'Delete failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error during delete' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { setMessage({ type: 'error', text: 'Name is required' }); return; }
    if (!editingMember && !image) { setMessage({ type: 'error', text: 'Please upload a profile photo' }); return; }

    const token = getAuthToken();
    if (!token) {
      setMessage({ type: 'error', text: 'Session expired.' });
      setTimeout(() => router.push('/login'), 1500);
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('position', formData.position);
      fd.append('shortinfo', formData.shortinfo);
      fd.append('contactNumber', formData.contactNumber);
      fd.append('certifications', JSON.stringify(formData.certifications.filter(c => c.title.trim())));
      fd.append('socialLinks', JSON.stringify(formData.socialLinks));
      if (image) fd.append('image', image);

      const url = editingMember ? `${API_BASE}/teams/${editingMember._id}` : `${API_BASE}/teams`;
      const method = editingMember ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: fd });
      const result = await res.json();

      if (res.ok && result.success) {
        setMessage({ type: 'success', text: editingMember ? 'Team member updated!' : 'Team member added!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        handleCancelEdit();
        fetchMembers();
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
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.position?.toLowerCase().includes(q) ||
      m.shortinfo?.toLowerCase().includes(q)
    );
  }, [members, search]);

  return (
    <div className="p-5 md:p-7 min-h-screen bg-[#f5f7fa]">

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors">
            <FiArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              Team Members
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {editingMember ? `Editing ${editingMember.name}` : 'Team profiles shown on the website'}
            </p>
          </div>
        </div>
        <button
          onClick={fetchMembers}
          className="flex items-center gap-2 px-4 py-2 bg-[#0c1e35] text-white rounded-xl text-sm font-semibold hover:bg-[#0f2744] transition-colors"
        >
          <FiRefreshCw size={14} className={loadingMembers ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Form */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">{editingMember ? 'Edit Member' : 'Add Member'}</h2>
              {editingMember && (
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
                  Profile Photo {!editingMember && <span className="text-red-500">*</span>}
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

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Name *</label>
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange} required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm"
                  placeholder="Sarah Johnson"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Position</label>
                <input
                  type="text" name="position" value={formData.position} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm"
                  placeholder="Head of Product Quality"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> Contact Number
                </label>
                <input
                  type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm"
                  placeholder="+44 7911 123456"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Short Bio</label>
                <textarea
                  name="shortinfo" value={formData.shortinfo} onChange={handleChange} rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm resize-none"
                  placeholder="Their expertise, passion for dogs, etc."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Certifications</label>
                  <button
                    type="button"
                    onClick={addCertification}
                    className="flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-[11px] rounded-lg hover:bg-amber-600 transition"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </div>
                {formData.certifications.length === 0 ? (
                  <p className="text-[11px] text-gray-400 italic text-center py-2">No certifications added</p>
                ) : (
                  <div className="space-y-2">
                    {formData.certifications.map((cert, idx) => (
                      <div key={idx} className="flex gap-1.5 p-2 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-1 space-y-1.5">
                          <input
                            type="text" value={cert.title}
                            onChange={(e) => updateCertification(idx, 'title', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none"
                            placeholder="Certified Pet Nutritionist"
                          />
                          <input
                            type="url" value={cert.imageUrls}
                            onChange={(e) => updateCertification(idx, 'imageUrls', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none"
                            placeholder="Certificate image URL (optional)"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCertification(idx)}
                          className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex-shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Social Links</label>
                <div className="grid grid-cols-1 gap-2">
                  {SOCIAL_PLATFORMS.map(platform => (
                    <input
                      key={platform}
                      type="url"
                      value={formData.socialLinks[platform]}
                      onChange={(e) => handleSocialChange(platform, e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none"
                      placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition disabled:opacity-50 text-sm"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />{editingMember ? 'Updating…' : 'Adding…'}</>
                ) : (
                  <><Save className="w-4 h-4" />{editingMember ? 'Update Member' : 'Add Member'}</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Members list */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <header className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-amber-50 to-white border-b border-gray-100 gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Team</span>
                <span className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700 tabular-nums">{members.length}</span> {members.length === 1 ? 'member' : 'members'}
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

            {loadingMembers ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No team members found</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {filtered.map(member => {
                  const socials = Object.entries(member.socialLinks || {}).filter(([, v]) => v);
                  return (
                    <li
                      key={member._id}
                      className={`flex items-start gap-4 px-5 py-4 hover:bg-amber-50/30 transition-colors ${
                        editingMember?._id === member._id ? 'bg-amber-50' : ''
                      }`}
                    >
                      {member.image ? (
                        <img src={member.image} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-amber-200 flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          {initials(member.name)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{member.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{member.position || '—'}</p>
                        {member.shortinfo && (
                          <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">{member.shortinfo}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {member.contactNumber && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">📞 {member.contactNumber}</span>
                          )}
                          {member.certifications && member.certifications.length > 0 && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                              {member.certifications.length} cert{member.certifications.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          {socials.map(([platform]) => (
                            <span key={platform} className="text-[10px] font-medium px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full capitalize">
                              {platform}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEdit(member)}
                          title="Edit"
                          className="p-2 rounded-lg border border-gray-200 bg-white text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(member)}
                          title="Remove"
                          className="p-2 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
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
                <h3 className="text-lg font-bold text-gray-800">Remove team member?</h3>
                <p className="text-xs text-gray-500">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Permanently remove <span className="font-semibold">{deleteTarget.name}</span> from the team?
            </p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition">Cancel</button>
              <button onClick={confirmDelete} disabled={loading} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition disabled:opacity-60">
                {loading ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

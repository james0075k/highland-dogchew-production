'use client';

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
  Upload, Trash2, Save, Edit2, Users, X, Plus, ChevronRight, ChevronLeft,
  Phone, Briefcase, AlertCircle, Check, Loader2,
} from 'lucide-react';

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

const emptyForm: FormState = {
  name: '',
  position: '',
  shortinfo: '',
  contactNumber: '',
  certifications: [],
  socialLinks: { facebook: '', linkedin: '', twitter: '', github: '', instagram: '' },
};

const SOCIAL_ICONS: Record<string, string> = {
  facebook: '🌐',
  linkedin: '💼',
  twitter: '🐦',
  github: '🐙',
  instagram: '📷',
};

export default function TeamDashboard() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<any | null>(null);

  useEffect(() => {
    fetchMembers();
    return () => {
      if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    };
  }, []);

  const fetchMembers = async () => {
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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Certifications
  const addCertification = () =>
    setFormData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, { title: '', imageUrls: '' }],
    }));

  const updateCertification = (idx: number, field: keyof Certification, value: string) => {
    const updated = [...formData.certifications];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData((prev) => ({ ...prev, certifications: updated }));
  };

  const removeCertification = (idx: number) =>
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== idx),
    }));

  const handleEdit = (member: any) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      position: member.position || '',
      shortinfo: member.shortinfo || '',
      contactNumber: member.contactNumber || '',
      certifications: member.certifications?.length
        ? member.certifications.map((c: any) => ({ title: c.title || '', imageUrls: c.imageUrls || '' }))
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

  const handleDeleteClick = (member: any) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!memberToDelete?._id) return;
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const res = await fetch(`${API_BASE}/teams/${memberToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setMessage({ type: 'success', text: 'Team member deleted!' });
        setShowDeleteModal(false);
        setMemberToDelete(null);
        if (editingMember?._id === memberToDelete._id) handleCancelEdit();
        fetchMembers();
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
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' });
      return;
    }
    if (!editingMember && !image) {
      setMessage({ type: 'error', text: 'Please upload a profile photo' });
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
      fd.append(
        'certifications',
        JSON.stringify(
          formData.certifications.filter((c) => c.title.trim())
        )
      );
      fd.append('socialLinks', JSON.stringify(formData.socialLinks));
      if (image) fd.append('image', image);

      const token = Cookies.get('token');
      const url = editingMember
        ? `${API_BASE}/teams/${editingMember._id}`
        : `${API_BASE}/teams`;
      const method = editingMember ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setMessage({
          type: 'success',
          text: editingMember ? 'Team member updated!' : 'Team member added!',
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        handleCancelEdit();
        fetchMembers();
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
      {/* Sidebar toggle button */}
      <button
        type="button"
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed top-24 right-4 z-50 bg-amber-500 text-white p-3 rounded-full shadow-lg hover:bg-amber-600 transition"
      >
        {showSidebar ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-6 h-6 text-amber-500" />
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your team members displayed on the website
              </p>
            </div>
            {editingMember && (
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
            {/* ─── Profile Photo ─── */}
            <div className="border-b pb-6">
              <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-500" />
                Profile Photo {!editingMember && <span className="text-red-500">*</span>}
              </h2>
              <div className="flex items-start gap-5">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-amber-400 transition bg-gray-50 hover:bg-amber-50">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Click to upload photo</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>

                {imagePreview && (
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-amber-200 shadow-md flex-shrink-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImage(null); setImagePreview(null); }}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ─── Basic Info ─── */}
            <div className="border-b pb-6">
              <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-500" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition"
                    placeholder="e.g. Sarah Johnson"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Job Title / Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition"
                    placeholder="e.g. Head of Product Quality"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-500" />
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition"
                    placeholder="+44 7911 123456"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Short Bio / About
                  </label>
                  <textarea
                    name="shortinfo"
                    value={formData.shortinfo}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition resize-none"
                    placeholder="Write a short bio about this team member — their expertise, passion for dogs, years of experience, etc."
                  />
                </div>
              </div>
            </div>

            {/* ─── Certifications ─── */}
            <div className="border-b pb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold text-gray-700">
                  Certifications & Achievements
                </h2>
                <button
                  type="button"
                  onClick={addCertification}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              {formData.certifications.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-3">
                  No certifications added yet
                </p>
              ) : (
                <div className="space-y-3">
                  {formData.certifications.map((cert, idx) => (
                    <div key={idx} className="flex gap-2 items-start p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={cert.title}
                          onChange={(e) => updateCertification(idx, 'title', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="e.g. Certified Pet Nutritionist"
                        />
                        <input
                          type="url"
                          value={cert.imageUrls}
                          onChange={(e) => updateCertification(idx, 'imageUrls', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="Certificate image URL (optional)"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCertification(idx)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ─── Social Links ─── */}
            <div className="border-b pb-6">
              <h2 className="text-base font-semibold text-gray-700 mb-4">
                Social Media Links
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(Object.keys(SOCIAL_ICONS) as Array<keyof SocialLinks>).map((platform) => (
                  <div key={platform}>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 capitalize">
                      {SOCIAL_ICONS[platform]} {platform}
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks[platform]}
                      onChange={(e) => handleSocialChange(platform, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                      placeholder={`https://${platform}.com/...`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Submit ─── */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {editingMember ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editingMember ? 'Update Team Member' : 'Add Team Member'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ─── Sidebar: Team Members List ─── */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl transition-transform duration-300 z-40 ${
          showSidebar ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '300px' }}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <h2 className="text-base font-bold">Team ({members.length})</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSidebar(false)}
                className="hover:bg-white/20 p-1 rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Members list */}
          <div className="flex-1 overflow-y-auto p-3">
            {loadingMembers ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No team members yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member._id}
                    className={`rounded-xl p-3 border transition ${
                      editingMember?._id === member._id
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-gray-200 bg-gray-50 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex gap-3 items-center">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-amber-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-amber-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{member.name}</p>
                        <p className="text-xs text-gray-500 truncate">{member.position}</p>
                        {member.shortinfo && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">{member.shortinfo}</p>
                        )}
                      </div>
                    </div>

                    {/* Social icons preview */}
                    {member.socialLinks && Object.values(member.socialLinks).some(Boolean) && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {Object.entries(member.socialLinks)
                          .filter(([, v]) => v)
                          .map(([platform]) => (
                            <span
                              key={platform}
                              className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded capitalize"
                            >
                              {platform}
                            </span>
                          ))}
                      </div>
                    )}

                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(member)}
                        className="flex-1 py-1 px-2 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(member)}
                        className="flex-1 py-1 px-2 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
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
              onClick={fetchMembers}
              className="w-full py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ─── Delete Confirmation Modal ─── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Remove Team Member</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Are you sure you want to remove{' '}
                  <span className="font-semibold text-gray-700">{memberToDelete?.name}</span>
                  {' '}from the team? This cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="p-1 rounded hover:bg-gray-100 flex-shrink-0"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {loading ? 'Deleting...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

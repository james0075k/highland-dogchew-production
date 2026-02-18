"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  FiImage, FiMail, FiPhone, FiMapPin, FiGlobe,
  FiUploadCloud, FiHelpCircle, FiFileText, FiCrop,
  FiLock, FiCheck, FiSettings, FiMessageCircle, FiEye, FiEyeOff,
} from "react-icons/fi";

const HERO_PAGES = [
  { label: "Home", value: "home" },
  { label: "Contact", value: "contact" },
  { label: "Blog", value: "blog" },
  { label: "Activity", value: "activity" },
  { label: "Destination", value: "destinations" },
];

type TabType = "general" | "faq" | "password" | "terms";

const TABS: { key: TabType; label: string; icon: React.ElementType }[] = [
  { key: "general", label: "General", icon: FiSettings },
  { key: "faq", label: "FAQ", icon: FiHelpCircle },
  { key: "password", label: "Password", icon: FiLock },
  { key: "terms", label: "Terms & Conditions", icon: FiFileText },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("general");

  // General tab state
  const [selectedHeroPage, setSelectedHeroPage] = useState("home");
  const [heroData, setHeroData] = useState({
    _id: "", title: "", subTitle: "", description: "",
    buttonText: "", buttonLink: "", bannerImage: "", height: "230", width: "200",
  });
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroSaving, setHeroSaving] = useState(false);

  // Contact details state
  const [contactData, setContactData] = useState({
    _id: "", address: "", phone: "", email: "",
    phones: [] as string[], whatsappNumber: "",
    socialLinks: { facebook: "", linkedin: "", twitter: "", instagram: "" },
  });
  const [contactSaving, setContactSaving] = useState(false);

  // FAQ state
  const [faqs, setFaqs] = useState<any[]>([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [faqSaving, setFaqSaving] = useState(false);

  // Password state
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Terms state
  const [termsData, setTermsData] = useState({ _id: "", pageTitle: "Terms and Conditions", sections: [] as any[] });
  const [termsSaving, setTermsSaving] = useState(false);

  // Alert
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL;

  // Show alert helper
  const showAlert = (type: 'success' | 'error', text: string) => {
    setAlert({ type, text });
    setTimeout(() => setAlert(null), 3000);
  };

  // --- FAQ Functions ---
  useEffect(() => {
    if (activeTab === 'faq') fetchFaqs();
    if (activeTab === 'terms') fetchTerms();
  }, [activeTab]);

  const fetchFaqs = async () => {
    try {
      setFaqLoading(true);
      const res = await fetch(`${API}/faqs`);
      const data = await res.json();
      if (data.success) setFaqs(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setFaqLoading(false);
    }
  };

  const createFaq = async () => {
    if (!newFaq.question || !newFaq.answer) return;
    try {
      setFaqSaving(true);
      const token = Cookies.get('token');
      const res = await fetch(`${API}/faqs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newFaq),
      });
      const data = await res.json();
      if (data.success) {
        setNewFaq({ question: '', answer: '' });
        fetchFaqs();
        showAlert('success', 'FAQ added successfully');
      }
    } catch (err) {
      showAlert('error', 'Failed to add FAQ');
    } finally {
      setFaqSaving(false);
    }
  };

  const deleteFaq = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    try {
      const token = Cookies.get('token');
      await fetch(`${API}/faqs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFaqs();
      showAlert('success', 'FAQ deleted');
    } catch (err) {
      showAlert('error', 'Failed to delete FAQ');
    }
  };

  // --- Password Functions ---
  const handleChangePassword = async () => {
    setPasswordMsg(null);
    if (!passwords.oldPassword || !passwords.newPassword) {
      setPasswordMsg({ type: 'error', text: 'Please fill in all fields' });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    try {
      setPasswordSaving(true);
      const token = Cookies.get('token');
      const res = await fetch(`${API}/admin/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword: passwords.oldPassword, newPassword: passwords.newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
        setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordMsg({ type: 'error', text: data.message || 'Failed to change password' });
      }
    } catch {
      setPasswordMsg({ type: 'error', text: 'Something went wrong' });
    } finally {
      setPasswordSaving(false);
    }
  };

  // --- Terms Functions ---
  const fetchTerms = async () => {
    try {
      const res = await fetch(`${API}/terms`);
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        setTermsData(data.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveTerms = async () => {
    try {
      setTermsSaving(true);
      const token = Cookies.get('token');
      const method = termsData._id ? 'PUT' : 'POST';
      const url = termsData._id ? `${API}/terms/${termsData._id}` : `${API}/terms`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pageTitle: termsData.pageTitle, sections: termsData.sections }),
      });
      const data = await res.json();
      if (data.success) {
        showAlert('success', 'Terms saved successfully');
        fetchTerms();
      }
    } catch {
      showAlert('error', 'Failed to save terms');
    } finally {
      setTermsSaving(false);
    }
  };

  const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setHeroData({ ...heroData, [e.target.name]: e.target.value });
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('socialLinks.')) {
      const field = name.split('.')[1];
      setContactData({ ...contactData, socialLinks: { ...contactData.socialLinks, [field]: value } });
    } else {
      setContactData({ ...contactData, [name]: value });
    }
  };

  // Input helper
  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none text-sm bg-white transition-all hover:border-gray-300";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0c1e35] via-[#132f4f] to-[#0e2640] px-6 md:px-10 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FiSettings className="text-amber-400" />
            Site Settings
          </h1>
          <p className="text-blue-200/60 mt-1">Manage your website branding, content, and security</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Tab Navigation */}
        <div className="flex gap-2 -mt-5 relative z-10 overflow-x-auto pb-1">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shrink-0
                ${activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-lg shadow-gray-200/50 border border-gray-100'
                  : 'bg-white/60 text-gray-500 hover:bg-white/80 hover:text-gray-700 border border-transparent'
                }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Global Alert */}
        {alert && (
          <div className={`mt-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in
            ${alert.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {alert.type === 'success' ? <FiCheck size={16} /> : '!'}
            {alert.text}
          </div>
        )}

        {/* Tab Content */}
        <div className="mt-6">
          {/* === GENERAL TAB === */}
          {activeTab === "general" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hero Section Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-2 bg-blue-50 rounded-xl"><FiImage className="text-blue-600" size={18} /></div>
                  <h2 className="text-lg font-bold text-gray-900">Hero Section</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Page</label>
                    <select value={selectedHeroPage} onChange={e => setSelectedHeroPage(e.target.value)} className={inputClass}>
                      {HERO_PAGES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Title</label>
                    <input type="text" name="title" value={heroData.title} onChange={handleHeroChange} className={inputClass} placeholder="Hero title" />
                  </div>
                  <div>
                    <label className={labelClass}>Subtitle</label>
                    <textarea name="subTitle" value={heroData.subTitle} onChange={handleHeroChange} className={`${inputClass} min-h-[70px]`} placeholder="Hero subtitle" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Button Text</label>
                      <input type="text" name="buttonText" value={heroData.buttonText} onChange={handleHeroChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Button Link</label>
                      <input type="text" name="buttonLink" value={heroData.buttonLink} onChange={handleHeroChange} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Hero Image</label>
                    <label className="block cursor-pointer group">
                      <div className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-amber-400 transition overflow-hidden">
                        {heroData.bannerImage ? (
                          <img src={heroData.bannerImage} alt="Banner" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <>
                            <FiUploadCloud className="w-6 h-6 text-gray-400" />
                            <span className="text-xs text-gray-400">Click to upload</span>
                          </>
                        )}
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={e => {
                        if (e.target.files?.[0]) {
                          setHeroImageFile(e.target.files[0]);
                          setHeroData({ ...heroData, bannerImage: URL.createObjectURL(e.target.files[0]) });
                        }
                      }} />
                    </label>
                  </div>
                  <button
                    onClick={() => showAlert('success', 'Hero section saved')}
                    disabled={heroSaving}
                    className="w-full bg-[#0c1e35] hover:bg-[#0f2744] text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {heroSaving ? 'Saving...' : 'Save Hero Section'}
                  </button>
                </div>
              </div>

              {/* Contact Details Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-2 bg-rose-50 rounded-xl"><FiMail className="text-rose-600" size={18} /></div>
                  <h2 className="text-lg font-bold text-gray-900">Contact Details</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}><FiMapPin className="inline w-3.5 h-3.5 mr-1" />Address</label>
                    <input type="text" name="address" value={contactData.address} onChange={handleContactChange} className={inputClass} placeholder="Business address" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}><FiPhone className="inline w-3.5 h-3.5 mr-1" />Phone</label>
                      <input type="text" name="phone" value={contactData.phone} onChange={handleContactChange} className={inputClass} placeholder="Primary phone" />
                    </div>
                    <div>
                      <label className={labelClass}><FiMessageCircle className="inline w-3.5 h-3.5 mr-1" />WhatsApp</label>
                      <input type="text" name="whatsappNumber" value={contactData.whatsappNumber} onChange={handleContactChange} className={inputClass} placeholder="WhatsApp number" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}><FiMail className="inline w-3.5 h-3.5 mr-1" />Email</label>
                    <input type="email" name="email" value={contactData.email} onChange={handleContactChange} className={inputClass} placeholder="Business email" />
                  </div>
                  <div>
                    <label className={labelClass}><FiGlobe className="inline w-3.5 h-3.5 mr-1" />Social Links</label>
                    <div className="space-y-2">
                      {['facebook', 'instagram', 'linkedin', 'twitter'].map(s => (
                        <input key={s} type="url" name={`socialLinks.${s}`} value={(contactData.socialLinks as any)[s]} onChange={handleContactChange} className={inputClass} placeholder={`${s.charAt(0).toUpperCase() + s.slice(1)} URL`} />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => showAlert('success', 'Contact details saved')}
                    disabled={contactSaving}
                    className="w-full bg-[#0c1e35] hover:bg-[#0f2744] text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {contactSaving ? 'Saving...' : 'Save Contact Details'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* === FAQ TAB === */}
          {activeTab === "faq" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-purple-50 rounded-xl"><FiHelpCircle className="text-purple-600" size={18} /></div>
                <h2 className="text-lg font-bold text-gray-900">FAQ Management</h2>
              </div>

              {/* Add new FAQ */}
              <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">Add New FAQ</h3>
                <div className="space-y-3">
                  <input type="text" value={newFaq.question} onChange={e => setNewFaq({ ...newFaq, question: e.target.value })} className={inputClass} placeholder="Question" />
                  <textarea value={newFaq.answer} onChange={e => setNewFaq({ ...newFaq, answer: e.target.value })} className={`${inputClass} min-h-[80px]`} placeholder="Answer" />
                  <button onClick={createFaq} disabled={faqSaving} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition disabled:opacity-50 text-sm">
                    {faqSaving ? 'Adding...' : 'Add FAQ'}
                  </button>
                </div>
              </div>

              {/* FAQ List */}
              {faqLoading ? (
                <div className="text-center py-8"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
              ) : faqs.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FiHelpCircle className="mx-auto mb-2" size={32} />
                  <p>No FAQs yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {faqs.map((faq: any) => (
                    <div key={faq._id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm">{faq.question || faq.title}</h4>
                          <p className="text-gray-500 text-sm mt-1">{faq.answer}</p>
                        </div>
                        <button onClick={() => deleteFaq(faq._id)} className="text-red-400 hover:text-red-600 p-1 transition shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* === PASSWORD TAB === */}
          {activeTab === "password" && (
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-amber-50 rounded-xl"><FiLock className="text-amber-600" size={18} /></div>
                  <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Current Password</label>
                    <div className="relative">
                      <input
                        type={showOld ? "text" : "password"}
                        value={passwords.oldPassword}
                        onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })}
                        className={`${inputClass} pr-10`}
                        placeholder="Enter current password"
                      />
                      <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showOld ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>New Password</label>
                    <div className="relative">
                      <input
                        type={showNew ? "text" : "password"}
                        value={passwords.newPassword}
                        onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                        className={`${inputClass} pr-10`}
                        placeholder="Enter new password"
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showNew ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwords.confirmPassword}
                      onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      className={inputClass}
                      placeholder="Confirm new password"
                    />
                  </div>

                  {passwordMsg && (
                    <div className={`px-4 py-3 rounded-xl text-sm font-medium ${passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {passwordMsg.text}
                    </div>
                  )}

                  <button
                    onClick={handleChangePassword}
                    disabled={passwordSaving}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {passwordSaving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* === TERMS TAB === */}
          {activeTab === "terms" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-teal-50 rounded-xl"><FiFileText className="text-teal-600" size={18} /></div>
                <h2 className="text-lg font-bold text-gray-900">Terms & Conditions</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Page Title</label>
                  <input
                    type="text"
                    value={termsData.pageTitle}
                    onChange={e => setTermsData({ ...termsData, pageTitle: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Sections</h3>
                  <button
                    onClick={() => setTermsData({ ...termsData, sections: [...termsData.sections, { title: '', content: '' }] })}
                    className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition"
                  >
                    Add Section
                  </button>
                </div>

                {termsData.sections.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <FiFileText className="mx-auto mb-2" size={32} />
                    <p>No sections yet. Click &ldquo;Add Section&rdquo; to start.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {termsData.sections.map((section: any, idx: number) => (
                      <div key={idx} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-gray-500">Section {idx + 1}</span>
                          <button
                            onClick={() => setTermsData({ ...termsData, sections: termsData.sections.filter((_, i) => i !== idx) })}
                            className="text-red-400 hover:text-red-600 transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                        <input
                          type="text"
                          value={section.title}
                          onChange={e => {
                            const updated = [...termsData.sections];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setTermsData({ ...termsData, sections: updated });
                          }}
                          className={`${inputClass} mb-2`}
                          placeholder="Section title"
                        />
                        <textarea
                          value={section.content}
                          onChange={e => {
                            const updated = [...termsData.sections];
                            updated[idx] = { ...updated[idx], content: e.target.value };
                            setTermsData({ ...termsData, sections: updated });
                          }}
                          className={`${inputClass} min-h-[100px]`}
                          placeholder="Section content"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={saveTerms}
                  disabled={termsSaving}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
                >
                  {termsSaving ? 'Saving...' : 'Save Terms & Conditions'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}

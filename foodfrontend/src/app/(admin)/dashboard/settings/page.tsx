"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
  FiImage, FiMail, FiPhone, FiMapPin, FiGlobe,
  FiUploadCloud, FiHelpCircle, FiFileText,
  FiCheck, FiSettings, FiMessageCircle, FiAlertCircle,
  FiTrash2, FiPlus, FiLock, FiEye, FiEyeOff, FiShield, FiArrowLeft,
} from "react-icons/fi";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter, FaTiktok } from "react-icons/fa";

/* ─── types ──────────────────────────────────────────────────────────── */
type TabType = "general" | "faq" | "password" | "terms";

const HERO_PAGES = [
  { label: "Home", value: "home" },
  { label: "Contact", value: "contact" },
  { label: "Blog", value: "blog" },
  { label: "Activity", value: "activity" },
  { label: "Destination", value: "destinations" },
];

const TABS: { key: TabType; label: string; icon: React.ElementType }[] = [
  { key: "general",  label: "General",           icon: FiSettings  },
  { key: "faq",      label: "FAQ",               icon: FiHelpCircle },
  { key: "password", label: "Password",          icon: FiLock      },
  { key: "terms",    label: "Terms & Conditions",icon: FiFileText  },
];

/* ─── shared style tokens ─────────────────────────────────────────────── */
const input =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white outline-none " +
  "focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 hover:border-gray-300 transition-all";
const label = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

/* ─── reusable card wrapper ──────────────────────────────────────────── */
function Card({
  icon, iconBg, iconColor, title, children,
}: {
  icon: React.ReactNode; iconBg: string; iconColor: string;
  title: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* card header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
      </div>
      {/* card body */}
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

/* ─── save button ─────────────────────────────────────────────────────── */
function SaveBtn({ loading, label: text, onClick, color = "navy" }: {
  loading: boolean; label: string; onClick: () => void; color?: "navy" | "teal" | "purple";
}) {
  const bg: Record<string, string> = {
    navy:   "bg-[#0c1e35] hover:bg-[#0f2744]",
    teal:   "bg-teal-600  hover:bg-teal-700",
    purple: "bg-violet-600 hover:bg-violet-700",
  };
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50 ${bg[color]}`}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      ) : (
        <FiCheck size={15} />
      )}
      {loading ? "Saving…" : text}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("general");

  /* hero state */
  const [selectedHeroPage, setSelectedHeroPage] = useState("home");
  const [heroData, setHeroData] = useState({
    _id: "", title: "", subTitle: "", buttonText: "", buttonLink: "", bannerImage: "",
  });
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroSaving, setHeroSaving] = useState(false);

  /* contact state */
  const [contactData, setContactData] = useState({
    _id: "", address: "", phone: "", email: "", phones: [] as string[],
    whatsappNumber: "",
    socialLinks: { facebook: "", instagram: "", linkedin: "", twitter: "", tiktok: "" },
  });
  const [contactSaving, setContactSaving] = useState(false);

  /* faq state */
  const [faqs, setFaqs] = useState<any[]>([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const [faqSaving, setFaqSaving] = useState(false);
  const [faqDeleteTarget, setFaqDeleteTarget] = useState<any | null>(null);
  const [faqDeleting, setFaqDeleting] = useState(false);

  /* terms state */
  const [termsData, setTermsData] = useState({ _id: "", pageTitle: "Terms and Conditions", sections: [] as any[] });
  const [termsSaving, setTermsSaving] = useState(false);

  /* password state */
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* instagram settings state */
  const [igSettings, setIgSettings] = useState({ isEnabled: true, postsCount: 8 });
  const [igSaving, setIgSaving] = useState(false);

  /* alert */
  const [alert, setAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL;

  /* ── load contact + instagram settings on mount ── */
  useEffect(() => {
    (async () => {
      try {
        const [contactRes, igRes] = await Promise.allSettled([
          fetch(`${API}/info`, { credentials: "include" }).then(r => r.json()),
          fetch(`${API}/instagram/settings`).then(r => r.json()),
        ]);

        if (contactRes.status === "fulfilled") {
          const data = contactRes.value;
          if (data.success && data.data) {
            const i = data.data;
            setContactData({
              _id: i._id || "",
              address: i.address || "",
              phone: i.phones?.[0] || i.phone || "",
              email: i.email || "",
              phones: i.phones || [],
              whatsappNumber: i.whatsappNumber || "",
              socialLinks: {
                facebook:  i.socialLinks?.facebook  || "",
                instagram: i.socialLinks?.instagram || "",
                linkedin:  i.socialLinks?.linkedin  || "",
                twitter:   i.socialLinks?.twitter   || "",
                tiktok:    i.socialLinks?.tiktok    || "",
              },
            });
          }
        }

        if (igRes.status === "fulfilled") {
          const igData = igRes.value;
          if (igData.success && igData.data) {
            setIgSettings({
              isEnabled: igData.data.isEnabled ?? true,
              postsCount: igData.data.postsCount ?? 8,
            });
          }
        }
      } catch {}
    })();
  }, []);

  /* ── load faq / terms on tab switch ── */
  useEffect(() => {
    if (activeTab === "faq")   fetchFaqs();
    if (activeTab === "terms") fetchTerms();
  }, [activeTab]);

  const showAlert = (type: "success" | "error", text: string) => {
    setAlert({ type, text });
    setTimeout(() => setAlert(null), 3500);
  };

  /* ── helpers ── */
  const getToken = () => Cookies.get("token") || localStorage.getItem("adminToken") || null;

  const clearToken = () => {
    Cookies.remove("token");
    localStorage.removeItem("adminToken");
  };

  const authHeader = () => {
    const token = getToken();
    if (!token) {
      showAlert("error", "Session expired. Please log in again.");
      setTimeout(() => router.push("/login"), 1500);
      return null;
    }
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  };

  /* ── hero ── */
  const saveHero = async () => {
    setHeroSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setHeroSaving(false);
    showAlert("success", "Hero section saved");
  };

  /* ── contact ── */
  const saveContact = async () => {
    const headers = authHeader();
    if (!headers) return;
    setContactSaving(true);
    try {
      const res = await fetch(`${API}/info`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          address: contactData.address,
          email: contactData.email,
          phones: contactData.phone ? [contactData.phone] : contactData.phones,
          whatsappNumber: contactData.whatsappNumber,
          socialLinks: contactData.socialLinks,
        }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("contactInfoUpdatedAt", String(Date.now()));
        showAlert("success", "Contact details saved");
      } else if (res.status === 401 || res.status === 403) {
        clearToken();
        showAlert("error", res.status === 403 ? "Access denied." : "Session expired. Redirecting…");
        if (res.status === 401) setTimeout(() => router.push("/login"), 1500);
      } else {
        showAlert("error", data.message || "Failed to save");
      }
    } catch {
      showAlert("error", "Failed to save contact details");
    } finally {
      setContactSaving(false);
    }
  };

  const onContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("socialLinks.")) {
      const field = name.split(".")[1];
      setContactData(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [field]: value } }));
    } else {
      setContactData(prev => ({ ...prev, [name]: value }));
    }
  };

  /* ── faq ── */
  const fetchFaqs = async () => {
    setFaqLoading(true);
    try {
      const res = await fetch(`${API}/faqs`);
      const data = await res.json();
      if (data.success) setFaqs(Array.isArray(data.data) ? data.data : []);
    } catch {} finally { setFaqLoading(false); }
  };

  const createFaq = async () => {
    if (!newFaq.question || !newFaq.answer) return;
    const headers = authHeader();
    if (!headers) return;
    setFaqSaving(true);
    try {
      const res = await fetch(`${API}/faqs`, {
        method: "POST", headers, body: JSON.stringify(newFaq),
      });
      const data = await res.json();
      if (data.success) { setNewFaq({ question: "", answer: "" }); fetchFaqs(); showAlert("success", "FAQ added"); }
    } catch { showAlert("error", "Failed to add FAQ"); } finally { setFaqSaving(false); }
  };

  const confirmDeleteFaq = async () => {
    if (!faqDeleteTarget?._id) return;
    const token = Cookies.get("token");
    setFaqDeleting(true);
    try {
      await fetch(`${API}/faqs/${faqDeleteTarget._id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setFaqs(prev => prev.filter(f => f._id !== faqDeleteTarget._id));
      showAlert("success", "FAQ deleted");
      setFaqDeleteTarget(null);
    } catch { showAlert("error", "Failed to delete FAQ"); }
    finally { setFaqDeleting(false); }
  };

  /* ── change password ── */
  const handleChangePassword = async () => {
    setPasswordMsg(null);
    if (!passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setPasswordMsg({ type: "error", text: "Please fill in all fields." });
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    const headers = authHeader();
    if (!headers) return;
    setPasswordSaving(true);
    try {
      const res = await fetch(`${API}/admin/change-password`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ oldPassword: passwords.oldPassword, newPassword: passwords.newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordMsg({ type: "success", text: data.message || "Password changed! A confirmation email has been sent." });
        setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else if (res.status === 401) {
        clearToken();
        setPasswordMsg({ type: "error", text: "Session expired. Please log in again." });
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setPasswordMsg({ type: "error", text: data.message || "Failed to change password." });
      }
    } catch {
      setPasswordMsg({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setPasswordSaving(false);
    }
  };

  /* ── instagram settings ── */
  const saveIgSettings = async () => {
    const headers = authHeader();
    if (!headers) return;
    setIgSaving(true);
    try {
      const res = await fetch(`${API}/instagram/settings`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          isEnabled: igSettings.isEnabled,
          postsCount: Number(igSettings.postsCount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showAlert("success", "Instagram settings saved");
      } else {
        showAlert("error", data.message || "Failed to save Instagram settings");
      }
    } catch {
      showAlert("error", "Failed to save Instagram settings");
    } finally {
      setIgSaving(false);
    }
  };

  /* ── terms ── */
  const fetchTerms = async () => {
    try {
      const res = await fetch(`${API}/terms`);
      const data = await res.json();
      if (data.success && data.data?.length > 0) setTermsData(data.data[0]);
    } catch {}
  };

  const saveTerms = async () => {
    const headers = authHeader();
    if (!headers) return;
    setTermsSaving(true);
    try {
      const method = termsData._id ? "PUT" : "POST";
      const url    = termsData._id ? `${API}/terms/${termsData._id}` : `${API}/terms`;
      const res    = await fetch(url, { method, headers, body: JSON.stringify({ pageTitle: termsData.pageTitle, sections: termsData.sections }) });
      const data   = await res.json();
      if (data.success) { showAlert("success", "Terms saved"); fetchTerms(); }
    } catch { showAlert("error", "Failed to save terms"); } finally { setTermsSaving(false); }
  };

  /* ════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#f5f7fa] p-5 md:p-7">

      {/* ── Page header ── */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors">
            <FiArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FiSettings className="text-amber-500" size={18} />
              Site Settings
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Branding, content & security</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto pb-16">

        {/* ── Tab bar ── */}
        <div className="flex gap-1 p-1 bg-white border border-gray-200 rounded-xl shadow-sm w-fit overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap
                ${activeTab === tab.key
                  ? "bg-[#0c1e35] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Global alert ── */}
        {alert && (
          <div className={`mt-5 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2
            ${alert.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-700 border border-red-200"}`}
          >
            {alert.type === "success" ? <FiCheck size={15} /> : <FiAlertCircle size={15} />}
            {alert.text}
          </div>
        )}

        {/* ══ GENERAL TAB ════════════════════════════════════════════════ */}
        {activeTab === "general" && (
          <div className="mt-6 space-y-6">

            {/* Contact Details */}
            <Card
              icon={<FiMail size={16} />}
              iconBg="bg-rose-50"
              iconColor="text-rose-500"
              title="Contact Details"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Address – full width */}
                <div className="sm:col-span-2">
                  <label className={label}><FiMapPin className="inline mb-0.5 mr-1" size={11} />Address</label>
                  <input type="text" name="address" value={contactData.address}
                    onChange={onContactChange} className={input} placeholder="Business address" />
                </div>

                {/* Phone */}
                <div>
                  <label className={label}><FiPhone className="inline mb-0.5 mr-1" size={11} />Phone</label>
                  <input type="text" name="phone" value={contactData.phone}
                    onChange={onContactChange} className={input} placeholder="+44 xxx xxx xxxx" />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className={label}><FiMessageCircle className="inline mb-0.5 mr-1" size={11} />WhatsApp</label>
                  <input type="text" name="whatsappNumber" value={contactData.whatsappNumber}
                    onChange={onContactChange} className={input} placeholder="+44 xxx xxx xxxx" />
                </div>

                {/* Email – full width */}
                <div className="sm:col-span-2">
                  <label className={label}><FiMail className="inline mb-0.5 mr-1" size={11} />Email</label>
                  <input type="email" name="email" value={contactData.email}
                    onChange={onContactChange} className={input} placeholder="hello@highlanddogchew.co.uk" />
                </div>
              </div>

              {/* Social links */}
              <div className="mt-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <FiGlobe size={11} /> Social Links
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {([
                    { key: "facebook",  icon: <FaFacebook  className="text-blue-600"  size={13} /> },
                    { key: "instagram", icon: <FaInstagram className="text-pink-500"  size={13} /> },
                    { key: "linkedin",  icon: <FaLinkedin  className="text-sky-600"   size={13} /> },
                    { key: "twitter",   icon: <FaTwitter   className="text-sky-400"   size={13} /> },
                    { key: "tiktok",    icon: <FaTiktok    className="text-gray-800"  size={13} /> },
                  ] as const).map(({ key, icon }) => (
                    <div key={key} className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>
                      <input
                        type="url"
                        name={`socialLinks.${key}`}
                        value={(contactData.socialLinks as any)[key]}
                        onChange={onContactChange}
                        className={`${input} pl-8`}
                        placeholder={`${key.charAt(0).toUpperCase() + key.slice(1)} URL`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <SaveBtn loading={contactSaving} label="Save Contact Details" onClick={saveContact} color="navy" />
              </div>
            </Card>

            {/* Hero Section */}
            <Card
              icon={<FiImage size={16} />}
              iconBg="bg-blue-50"
              iconColor="text-blue-500"
              title="Hero Section"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Page selector – full width */}
                <div className="sm:col-span-2">
                  <label className={label}>Page</label>
                  <select value={selectedHeroPage} onChange={e => setSelectedHeroPage(e.target.value)} className={input}>
                    {HERO_PAGES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>

                {/* Title */}
                <div className="sm:col-span-2">
                  <label className={label}>Title</label>
                  <input type="text" name="title" value={heroData.title}
                    onChange={e => setHeroData(d => ({ ...d, title: e.target.value }))}
                    className={input} placeholder="Hero heading" />
                </div>

                {/* Subtitle */}
                <div className="sm:col-span-2">
                  <label className={label}>Subtitle</label>
                  <textarea name="subTitle" value={heroData.subTitle}
                    onChange={e => setHeroData(d => ({ ...d, subTitle: e.target.value }))}
                    className={`${input} min-h-[72px] resize-none`} placeholder="Hero subheading" />
                </div>

                {/* Button text */}
                <div>
                  <label className={label}>Button Text</label>
                  <input type="text" name="buttonText" value={heroData.buttonText}
                    onChange={e => setHeroData(d => ({ ...d, buttonText: e.target.value }))}
                    className={input} placeholder="Shop Now" />
                </div>

                {/* Button link */}
                <div>
                  <label className={label}>Button Link</label>
                  <input type="text" name="buttonLink" value={heroData.buttonLink}
                    onChange={e => setHeroData(d => ({ ...d, buttonLink: e.target.value }))}
                    className={input} placeholder="/products" />
                </div>

                {/* Image upload */}
                <div className="sm:col-span-2">
                  <label className={label}>Hero Image</label>
                  <label className="block cursor-pointer">
                    <div className="w-full h-36 rounded-xl border-2 border-dashed border-gray-200 hover:border-amber-400 transition overflow-hidden flex items-center justify-center bg-gray-50">
                      {heroData.bannerImage ? (
                        <img src={heroData.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <FiUploadCloud size={24} />
                          <span className="text-xs">Click to upload image</span>
                        </div>
                      )}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      if (e.target.files?.[0]) {
                        setHeroImageFile(e.target.files[0]);
                        setHeroData(d => ({ ...d, bannerImage: URL.createObjectURL(e.target.files![0]) }));
                      }
                    }} />
                  </label>
                </div>
              </div>

              <div className="mt-5">
                <SaveBtn loading={heroSaving} label="Save Hero Section" onClick={saveHero} color="navy" />
              </div>
            </Card>

            {/* ── Instagram Feed ── */}
            <Card
              icon={<FaInstagram size={16} />}
              iconBg="bg-pink-50"
              iconColor="text-pink-500"
              title="Instagram Feed"
            >
              {/* Info banner */}
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5">
                <FaInstagram className="text-blue-500 mt-0.5 shrink-0" size={14} />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Live posts are fetched from Instagram Graph API using your{" "}
                  <strong>INSTAGRAM_ACCESS_TOKEN</strong> in the backend <code>.env</code>.{" "}
                  Token lasts <strong>60 days</strong> — refresh it before expiry.
                  If the token is missing, manually uploaded posts are shown instead.
                </p>
              </div>

              <div className="space-y-5">
                {/* Enable/Disable toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Show Instagram Section</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Toggle the Instagram feed on the homepage
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIgSettings(prev => ({ ...prev, isEnabled: !prev.isEnabled }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                      igSettings.isEnabled ? "bg-pink-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${
                        igSettings.isEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Posts count */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Number of posts to display (1 – 12)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={igSettings.postsCount}
                    onChange={e =>
                      setIgSettings(prev => ({
                        ...prev,
                        postsCount: Math.max(1, Math.min(12, Number(e.target.value))),
                      }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-pink-400/25 focus:border-pink-400 hover:border-gray-300 transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Cached for 30 minutes. Changing this setting clears the cache immediately.
                  </p>
                </div>

                <SaveBtn loading={igSaving} label="Save Instagram Settings" onClick={saveIgSettings} color="navy" />
              </div>
            </Card>

          </div>
        )}

        {/* ══ FAQ TAB ═════════════════════════════════════════════════════ */}
        {activeTab === "faq" && (
          <div className="mt-6">
            <Card
              icon={<FiHelpCircle size={16} />}
              iconBg="bg-violet-50"
              iconColor="text-violet-600"
              title="FAQ Management"
            >
              {/* Add form */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <FiPlus size={14} className="text-violet-500" /> Add New FAQ
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newFaq.question}
                    onChange={e => setNewFaq(q => ({ ...q, question: e.target.value }))}
                    className={input}
                    placeholder="Question"
                  />
                  <textarea
                    value={newFaq.answer}
                    onChange={e => setNewFaq(q => ({ ...q, answer: e.target.value }))}
                    className={`${input} min-h-[80px] resize-none`}
                    placeholder="Answer"
                  />
                  <SaveBtn loading={faqSaving} label="Add FAQ" onClick={createFaq} color="purple" />
                </div>
              </div>

              {/* FAQ list */}
              {faqLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-violet-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : faqs.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <FiHelpCircle className="mx-auto mb-2" size={30} />
                  <p className="text-sm">No FAQs yet. Add one above.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {faqs.map((faq: any) => (
                    <div key={faq._id} className="flex items-start gap-3 border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition group">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{faq.question || faq.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{faq.answer}</p>
                      </div>
                      <button
                        onClick={() => setFaqDeleteTarget(faq)}
                        className="shrink-0 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ══ PASSWORD TAB ════════════════════════════════════════════════ */}
        {activeTab === "password" && (
          <div className="mt-6 max-w-lg mx-auto">
            <Card
              icon={<FiShield size={16} />}
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
              title="Change Password"
            >
              {/* info banner */}
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
                <FiMail className="text-amber-500 mt-0.5 shrink-0" size={15} />
                <p className="text-xs text-amber-700 leading-relaxed">
                  After changing your password a <strong>confirmation email</strong> will be sent to your registered admin email via Gmail SMTP.
                </p>
              </div>

              <div className="space-y-4">
                {/* Current password */}
                <div>
                  <label className={label}><FiLock className="inline mb-0.5 mr-1" size={11} />Current Password</label>
                  <div className="relative">
                    <input
                      type={showOld ? "text" : "password"}
                      value={passwords.oldPassword}
                      onChange={e => setPasswords(p => ({ ...p, oldPassword: e.target.value }))}
                      className={`${input} pr-10`}
                      placeholder="Enter current password"
                    />
                    <button type="button" onClick={() => setShowOld(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showOld ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* New password */}
                <div>
                  <label className={label}><FiLock className="inline mb-0.5 mr-1" size={11} />New Password</label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={passwords.newPassword}
                      onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                      className={`${input} pr-10`}
                      placeholder="Min 6 characters"
                    />
                    <button type="button" onClick={() => setShowNew(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showNew ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div>
                  <label className={label}><FiLock className="inline mb-0.5 mr-1" size={11} />Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={passwords.confirmPassword}
                      onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                      className={`${input} pr-10`}
                      placeholder="Repeat new password"
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showConfirm ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Inline message */}
                {passwordMsg && (
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
                    ${passwordMsg.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {passwordMsg.type === "success" ? <FiCheck size={14} /> : <FiAlertCircle size={14} />}
                    {passwordMsg.text}
                  </div>
                )}

                <SaveBtn
                  loading={passwordSaving}
                  label="Change Password & Send Email"
                  onClick={handleChangePassword}
                  color="navy"
                />
              </div>
            </Card>
          </div>
        )}

        {/* ══ TERMS TAB ═══════════════════════════════════════════════════ */}
        {activeTab === "terms" && (
          <div className="mt-6">
            <Card
              icon={<FiFileText size={16} />}
              iconBg="bg-teal-50"
              iconColor="text-teal-600"
              title="Terms & Conditions"
            >
              <div className="space-y-5">
                <div>
                  <label className={label}>Page Title</label>
                  <input
                    type="text"
                    value={termsData.pageTitle}
                    onChange={e => setTermsData(d => ({ ...d, pageTitle: e.target.value }))}
                    className={input}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">Sections</p>
                  <button
                    onClick={() => setTermsData(d => ({ ...d, sections: [...d.sections, { title: "", content: "" }] }))}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition"
                  >
                    <FiPlus size={13} /> Add Section
                  </button>
                </div>

                {termsData.sections.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <FiFileText className="mx-auto mb-2" size={28} />
                    <p className="text-sm">No sections yet. Click &ldquo;Add Section&rdquo; to start.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {termsData.sections.map((section: any, idx: number) => (
                      <div key={idx} className="border border-gray-100 rounded-xl p-4 bg-gray-50/60">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Section {idx + 1}</span>
                          <button
                            onClick={() => setTermsData(d => ({ ...d, sections: d.sections.filter((_, i) => i !== idx) }))}
                            className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={section.title}
                          onChange={e => {
                            const updated = [...termsData.sections];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setTermsData(d => ({ ...d, sections: updated }));
                          }}
                          className={`${input} mb-2`}
                          placeholder="Section title"
                        />
                        <textarea
                          value={section.content}
                          onChange={e => {
                            const updated = [...termsData.sections];
                            updated[idx] = { ...updated[idx], content: e.target.value };
                            setTermsData(d => ({ ...d, sections: updated }));
                          }}
                          className={`${input} min-h-[100px] resize-none`}
                          placeholder="Section content"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <SaveBtn loading={termsSaving} label="Save Terms & Conditions" onClick={saveTerms} color="teal" />
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* FAQ delete confirmation */}
      {faqDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFaqDeleteTarget(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <FiTrash2 className="text-red-600" size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Delete FAQ?</h3>
                <p className="text-xs text-gray-500">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Permanently delete: <span className="font-semibold">{faqDeleteTarget.question || faqDeleteTarget.title}</span>?
            </p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setFaqDeleteTarget(null)} className="flex-1 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition">Cancel</button>
              <button onClick={confirmDeleteFaq} disabled={faqDeleting} className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition disabled:opacity-60">
                {faqDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}

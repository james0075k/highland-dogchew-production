"use client";

import { useState, useEffect } from "react";
import { FiEdit, FiTrash, FiCamera, FiX, FiAlertCircle } from "react-icons/fi";
import { MdStar, MdFavorite, MdAddCircle, MdWorkspacePremium, MdLocationOn } from "react-icons/md";
import Button from "@/components/atoms/button";
import { fetchAPI } from "@/utils/apiService";
import Pagination from "@/components/atoms/pagination";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Alert from "@/components/atoms/alert";

// Define a generic type for items
export interface ItemBase {
  _id?: string;
  id?: string | number;
  title?: string;
  name?: string;
  image?: string;
  imageUrl?:string;
  imageUrls:string;
  gallery?: string[];
  slug?: string;
  [key: string]: unknown;
}

// Improved safeString for arrays/objects
const safeString = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '';
    if (typeof value[0] === 'object' && value[0] !== null) {
      // Array of objects: try to show title/name or JSON
      return value
        .map((v) =>
          typeof v === 'object'
            ? (v.title || v.name || JSON.stringify(v))
            : String(v)
        )
        .join(', ');
    }
    // Array of primitives
    return value.join(', ');
  }
  if (typeof value === 'object') {
    if ('title' in value && typeof value.title === 'string' && value.title) return value.title;
    if ('name' in value && typeof value.name === 'string' && value.name) return value.name;
    return JSON.stringify(value);
  }
  return String(value);
};

type Column<T> = {
  label: string;
  accessor: keyof T;
  render?: (row: T) => React.ReactNode;
};

interface AdminTableProps<T> {
  title: string;
  buttonText: string;
  data: T[];
  columns: Column<T>[];
  endpoint: string;
  destinationId?: string;
  
}

// Helper: recursively blank out all values but keep structure
function deepTemplateClone(template) {
  const skipKeys = [
    'isfeatured', 'isFeatured', 'totaltrips', 'totalTrips'
  ];
  if (Array.isArray(template)) {
    if (template.length > 0 && typeof template[0] === 'object' && template[0] !== null) {
      return [deepTemplateClone(template[0])];
    }
    return [''];
  } else if (template && typeof template === 'object') {
    const result = {};
    for (const k in template) {
      if (skipKeys.includes(k) || skipKeys.includes(k.toLowerCase())) continue;
      const val = template[k];
      if (Array.isArray(val)) result[k] = deepTemplateClone(val);
      else if (typeof val === 'object' && val !== null) result[k] = deepTemplateClone(val);
      else result[k] = '';
    }
    return result;
  }
  return '';
}

export function AdminTable<T extends ItemBase>({
  title,
  buttonText,
  data: initialData,
  columns,
  endpoint,
  destinationId,
}: AdminTableProps<T>) {
  const [items, setItems] = useState<T[]>(initialData);
  const [showForm, setShowForm] = useState(false);
  const [currentItem, setCurrentItem] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const [alert, setAlert] = useState<{
    show: boolean;
    type: "confirm" | "success" | "error" | "warning";
    message: string;
    onConfirm: () => void;
    onCancel: (() => void) | undefined;
  }>({
    show: false,
    type: "confirm",
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const pathname = usePathname();

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);
  };

  const refreshData = async () => {
    try {
      setFetchError(null);
      const response = await fetchAPI<any>({
        endpoint,
        params: { page: currentPage, limit: itemsPerPage }
      });
      let data: T[] = [];
      let total = 0;
      if (response && Array.isArray(response.data)) {
        data = response.data;
        total = response.total || response.data.length;
      } else if (response && Array.isArray(response)) {
        data = response;
        total = response.length;
      }
      setItems(data);
      setTotalItems(total);
    } catch (error) {
      setItems([]);
      setTotalItems(0);
      setFetchError("Packages not available");
    }
  };

  useEffect(() => {
    refreshData();
  }, [endpoint, currentPage]);

  const handleEdit = (item: T) => {
    setCurrentItem(item);
    setShowForm(true);
  };

  const handleDelete = (item: T) => {
    setAlert({
      show: true,
      type: "confirm",
      message: "Are you sure you want to delete this item?",
      onConfirm: async () => {
        setAlert((prev) => ({ ...prev, show: false })); // Hide alert immediately
        setIsDeleting(true);
        setDeleteError(null);
        try {
          await fetchAPI({ endpoint, method: "DELETE", id: item._id || item.id });
          await refreshData();
          setAlert({
            show: true,
            type: "success",
            message: "Item deleted successfully!",
            onConfirm: () => setAlert((prev) => ({ ...prev, show: false })),
            onCancel: undefined,
          });
        } catch (err) {
          setAlert({
            show: true,
            type: "error",
            message: "Failed to delete item.",
            onConfirm: () => setAlert((prev) => ({ ...prev, show: false })),
            onCancel: undefined,
          });
        } finally {
          setIsDeleting(false);
        }
      },
      onCancel: () => setAlert((prev) => ({ ...prev, show: false })),
    });
  };

  const handleAddNew = () => {
    let emptyItem;
    if (items.length) {
      const template = items[0];
      emptyItem = deepTemplateClone(template);
    } else {
      emptyItem = { title: "" };
    }
    if (destinationId) {
      emptyItem.destination = destinationId;
    }
    setCurrentItem(emptyItem);
    setShowForm(true);
  };

  const handleSave = async (savedItem: T) => {
    setShowForm(false);
    setCurrentItem(null);
    await refreshData();
    showSuccessMessage(savedItem._id ? "Item updated!" : "Item added!");
  };

  // Helper: endpoints that should be view-only (no add/edit/delete)
  const isViewOnly = endpoint.startsWith('herobanner') || endpoint === 'pages';

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <Alert
        show={alert.show}
        type={alert.type}
        message={alert.message}
        onConfirm={alert.onConfirm}
        onCancel={alert.onCancel}
      />
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-8 py-6">
        {showSuccess && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
            {successMessage}
          </div>
        )}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <h2 className="text-2xl font-bold flex items-center gap-2">{title}</h2>
          {!isViewOnly && <Button text={buttonText} variant="primary" onClick={handleAddNew} />}
        </div>
        {((items.length === 0) || fetchError) && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-gray-500 text-lg mb-4">{fetchError || "Packages not available"}</div>
            {!isViewOnly && <Button text={buttonText} variant="primary" onClick={handleAddNew} />}
          </div>
        )}
        <div className={`grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5${items.length === 0 ? ' hidden' : ''}`}>
          {items.map((item) => {
            const itemId = item._id || item.id;
            const isBlog = endpoint === 'blogs';
            const cardContent = (
              <div
                className="relative rounded-xl overflow-hidden shadow group bg-white"
              >
                <div className="relative h-56">
                  <img
                    src={
                      typeof item.profileImage === 'string' && item.profileImage
                        ? item.profileImage
                        : safeString(item.image) || item.gallery?.[0] || item.imageUrl || item.imageUrls
                    }
                    alt={safeString(item.title) || item.name || 'Profile'}
                    className="w-full h-full object-cover"
                    onError={e => { (e.currentTarget as HTMLImageElement).src = '/fallback.jpg'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  {!isViewOnly && (
                    <div className="absolute top-3 right-3 flex gap-2 z-10">
                      <button className="bg-white/90 hover:bg-blue-100 p-2 rounded-full shadow" onClick={() => handleEdit(item)}>
                        <FiEdit className="text-blue-600" />
                      </button>
                      <button className="bg-white/90 hover:bg-red-100 p-2 rounded-full shadow" onClick={() => {
                        if (items.length === 1) {
                          setAlert({
                            show: true,
                            type: "error",
                            message: "At least one item is required. You cannot delete the last item.",
                            onConfirm: () => setAlert((prev) => ({ ...prev, show: false })),
                            onCancel: undefined,
                          });
                          return;
                        }
                        handleDelete(item);
                      }}>
                        <FiTrash className="text-red-600" />
                      </button>
                    </div>
                  )}
                  {/* Unified button logic: dashboard or packages */}
                  {itemId && !isBlog && (endpoint === 'activities' || endpoint === 'destinations') && (() => {
                    let href = '';
                    let title = '';
                    const slug = item.slug || (safeString(item.title)?.toLowerCase().replace(/\s+/g, '-') || itemId);
                    if (pathname && pathname.includes('/dashboard')) {
                      if (endpoint === 'activities') {
                        href = `/dashboard/customise-packages/activities/${slug}`;
                        title = 'See Dashboard Custom Activity Package';
                      } else if (endpoint === 'destinations') {
                        href = `/dashboard/customise-packages/destinations/${slug}`;
                        title = 'See Dashboard Custom Destination Package';
                      } else {
                        href = `/dashboard/customise-packages/${slug}`;
                        title = 'See Dashboard Custom Package';
                      }
                    } else {
                      href = `/customise-packages/${slug}/${slug}`;
                      title = 'See Custom Package';
                    }
                    return (
                      <Link href={href} legacyBehavior>
                        <a
                          className="flex items-center justify-center p-2 rounded-full bg-white/80 border border-blue-200 shadow-lg text-blue-600 absolute left-1/2 -translate-x-1/2 bottom-16 opacity-0 group-hover:opacity-100 group-hover:bottom-20 z-20 transition-all duration-300 hover:scale-110 hover:bg-blue-100"
                          style={{ boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.10)' }}
                          title={title}
                        >
                          {/* Package/Box Icon */}
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                            <line x1="12" y1="22.08" x2="12" y2="12" />
                          </svg>
                        </a>
                      </Link>
                    );
                  })()}
                  {/* Removed location icon from every card */}
                  <div className="absolute bottom-0 left-0 w-full p-4 flex items-center gap-2">
                    <span className="text-white font-bold text-lg drop-shadow">
                      {safeString(item.title) || safeString(item.name) || 'Untitled'}
                    </span>
                  </div>
                </div>
              </div>
            );
            return itemId ? (
              <div key={itemId} className="block">
                {cardContent}
              </div>
            ) : (
              <div key={itemId || Math.random()}> {cardContent} </div>
            );
          })}
        </div>
       
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            getPageUrl={() => '#'}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
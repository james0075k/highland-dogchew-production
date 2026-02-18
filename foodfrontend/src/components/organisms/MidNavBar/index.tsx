'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useScrollSpy from '@/hooks/useScrollSpy';

type BlogTab = { label: string; value: string };
type MidNavbarProps = {
  tabs: (string | BlogTab)[];
  isBlogPage?: boolean;
  blogCategories?: Array<{
    _id: string;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }>;
};

const MidNavbar = ({ tabs, isBlogPage = false, blogCategories = [] }: MidNavbarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams?.get('category') || 'all';

  const navRef = useRef<HTMLDivElement | null>(null);
  const navListRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState('');

  // Normalize tabs
  const normalizedTabs: BlogTab[] = tabs.map(tab =>
    typeof tab === 'string'
      ? { label: tab.replace('-', ' '), value: tab.replace(/\s+/g, '-').replace('/', '-') }
      : tab
  );

  // ScrollSpy for non-blog pages
  const scrollIds = normalizedTabs.map(t => ({ id: t.value }));
  const { activeSection: activeTab, scrollToSection: setActiveTab } = useScrollSpy(scrollIds);

  // Scroll nav bar into view on mobile load
  useEffect(() => {
    if (navRef.current) {
      setTimeout(() => {
        navRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, []);

  // Determine active tab
  const activeKey = isBlogPage
    ? activeCategory
    : activeTab || normalizedTabs[0]?.value;

  // Scroll active tab into center
  useEffect(() => {
    if (navListRef.current && activeKey) {
      const activeElement = document.getElementById(`nav-${activeKey}`);
      if (activeElement) {
        navListRef.current.scrollTo({
          left:
            activeElement.offsetLeft -
            navListRef.current.offsetWidth / 2 +
            activeElement.offsetWidth / 2,
          behavior: 'smooth',
        });
      }
    }
  }, [activeKey]);

  // Auto scroll to first tab section on load (non-blog pages)
  useEffect(() => {
    if (!isBlogPage && !activeTab && normalizedTabs[0]?.value) {
      const el = document.getElementById(normalizedTabs[0].value);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveTab(normalizedTabs[0].value);
      }
    }
  }, [activeTab, isBlogPage, normalizedTabs, setActiveTab]);

  // Tab click handler
  const handleTabClick = (value: string) => {
    if (isBlogPage) {
      const current = new URLSearchParams(searchParams?.toString());
      if (value === 'all') {
        current.delete('category');
      } else {
        current.set('category', value);
      }
      current.delete('page');
      router.push(`/blogs?${current.toString()}`);
    } else {
      const el = document.getElementById(value);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveTab(value);
      }
    }
  };

  const filteredCategories = blogCategories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Mobile Bottom Navbar */}
      <div
        ref={navRef}
        className="fixed inset-0 bottom-0 left-0 z-40 w-full md:hidden"
      >
        <div className="max-w-7xl mx-auto overflow-x-auto bg-light-beige scroll-smooth">
          <div ref={navListRef} className="flex flex-nowrap overflow-x-auto scrollbar-none py-2 px-3">
            {normalizedTabs.map(tab => {
              const isActive = activeKey === tab.value;
              return (
                <button
                  key={tab.value}
                  id={`nav-${tab.value}`}
                  onClick={() => handleTabClick(tab.value)}
                  className={`text-sm font-semibold px-5 py-2 whitespace-nowrap rounded-full ${
                    isActive ? ' text-primary' : 'text-black'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop Top Navbar */}
      <div className="hidden md:block sticky top-0 z-[40] bg-light-beige ">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-start overflow-x-auto">
            {normalizedTabs.map(tab => {
              const isActive = activeKey === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => handleTabClick(tab.value)}
                  className={`text-sm sm:text-base md:text-lg font-semibold px-7 py-3 whitespace-nowrap rounded-full ${
                    isActive ? ' text-primary' : 'text-black'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Optional Blog Category Search */}
      {blogCategories.length > 0 && (
        <div className="my-4 px-4 max-w-7xl mx-auto">
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded w-full"
          />
          <ul className="flex flex-wrap gap-2 mt-3">
            {filteredCategories.map(cat => (
              <li key={cat._id}>
                <span className="px-3 py-1 rounded bg-[#F7931E] text-white">{cat.name}</span>
              </li>
            ))}
            {filteredCategories.length === 0 && (
              <li className="text-gray-500">No categories found.</li>
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default MidNavbar;

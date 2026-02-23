"use client";
import React from "react";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  FiHome,
  FiBox,
  FiGrid,
  FiLayers,
  FiMail,
  FiStar,
  FiMessageSquare,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiX,
} from "react-icons/fi";
import { GiDogBowl } from "react-icons/gi";

const menuItems = [
  { icon: FiHome, text: "Dashboard", link: "/dashboard" },
  { icon: FiBox, text: "Products", link: "/dashboard/products" },
  { icon: FiGrid, text: "Puff Treats", link: "/dashboard/puff-treats" },
  { icon: FiLayers, text: "Highland Mix", link: "/dashboard/highland-mix" },
  { icon: GiDogBowl, text: "Varieties", link: "/dashboard/variety" },
  { icon: FiMail, text: "Contact Messages", link: "/dashboard/contact" },
  { icon: FiStar, text: "Reviews", link: "/dashboard/reviews" },
  { icon: FiMessageSquare, text: "Testimonials", link: "/dashboard/testimonials" },
  { icon: FiUsers, text: "Team", link: "/dashboard/customise-team" },
  { icon: FiSettings, text: "Settings", link: "/dashboard/settings" },
];

const Sidebar = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("refreshToken");
    router.push("/login");
  };

  const isActive = (link: string) => {
    if (link === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(link);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-[260px] z-50 transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          bg-gradient-to-b from-[#0c1e35] via-[#0f2744] to-[#091a2e]
          border-r border-white/5 shadow-2xl flex flex-col`}
      >
        {/* Brand Header */}
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow duration-300">
                <GiDogBowl className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-white font-bold text-base leading-tight">Highland</h1>
                <p className="text-amber-400/80 text-[11px] font-medium tracking-wider uppercase">Dog Chew</p>
              </div>
            </Link>
            <button
              className="md:hidden text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hidden">
          <p className="px-3 mb-2 text-[10px] font-semibold text-white/30 uppercase tracking-widest">Menu</p>
          {menuItems.map(({ icon: Icon, text, link }) => {
            const active = isActive(link);
            return (
              <Link
                key={link}
                href={link}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative
                  ${active
                    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-white shadow-sm"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
              >
                {/* Active indicator bar */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-amber-400 rounded-r-full" />
                )}

                <div className={`p-1.5 rounded-lg transition-colors duration-200
                  ${active
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white/70"
                  }`}
                >
                  <Icon size={16} />
                </div>
                <span className={`text-sm font-medium ${active ? "text-white" : ""}`}>
                  {text}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
          >
            <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-red-500/15 transition-colors">
              <FiLogOut size={16} />
            </div>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

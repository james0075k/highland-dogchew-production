"use client";
import { useState } from "react";
import Sidebar from "@/components/organisms/SideBar";
import { FiMenu } from "react-icons/fi";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f5f7fa]">
      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 bg-white/90 backdrop-blur-sm p-2.5 rounded-xl shadow-lg border border-gray-200/50 hover:bg-white transition-colors"
        onClick={() => setSidebarOpen(true)}
      >
        <FiMenu className="w-5 h-5 text-gray-700" />
      </button>

      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 min-h-screen w-full md:ml-[260px] transition-all">
        {children}
      </main>
    </div>
  );
}

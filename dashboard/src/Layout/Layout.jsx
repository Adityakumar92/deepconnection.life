import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../components/SideBar";
import Header from "../components/Header";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* ✅ Sticky Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      </header>

      {/* ✅ Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* ✅ Sidebar (scrolls independently) */}
        <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 overflow-y-auto custom-scrollbar">
          <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </aside>

        {/* ✅ Mobile Sidebar Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-lg overflow-y-auto custom-scrollbar">
              <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            </div>
          </div>
        )}

        {/* ✅ Main Outlet (scrolls independently) */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

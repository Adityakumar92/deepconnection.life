import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "../components/SideBar";
import Header from "../components/Header";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main content area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[20%_80%]">
        {/* Sidebar */}
        <div className="md:block hidden border-r border-gray-200 bg-white">
          <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        {/* Sidebar (mobile) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-lg">
              <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="p-6 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

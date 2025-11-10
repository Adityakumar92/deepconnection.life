import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings,
  ClipboardList,
  BookOpen,
  MessageSquare,
} from "lucide-react";

export default function SideBar({ sidebarOpen, setSidebarOpen }) {
  const [role, setRole] = useState('Admin');

  useEffect(() => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setRole(user.role || "Admin");
        }
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }, []);


  // ✅ Sidebar menu config array (easy to scale)
  const menuItems = [
    {
      title: "Main",
      items: [
        {
          name: "Dashboard",
          icon: <LayoutDashboard size={20} />,
          path: "/dashboard",
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          name: "Booking Management",
          icon: <ClipboardList size={20} />,
          path: "/dashboard/bookings",
        },
        {
          name: "Blog Management",
          icon: <BookOpen size={20} />,
          path: "/dashboard/blogs",
        },
        {
          name: "Contact Us",
          icon: <MessageSquare size={20} />,
          path: "/dashboard/contacts",
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          name: "Role & Permission",
          icon: <Settings size={20} />,
          path: "/dashboard/roles",
        },
        {
          name: "Backend Users",
          icon: <Users size={20} />,
          path: "/dashboard/users",
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static z-40 bg-white shadow-md w-64 min-h-screen transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Brand */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-indigo-600">{role}</h2>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-6">
          {menuItems.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {/* Section Title */}
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {section.title}
              </h3>

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item, itemIdx) => (
                  <NavLink
                    key={itemIdx}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition ${
                        isActive
                          ? "bg-indigo-100 text-indigo-700 font-medium"
                          : ""
                      }`
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

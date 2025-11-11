import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings,
  ClipboardList,
  BookOpen,
  MessageSquare,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export default function SideBar({ sidebarOpen, setSidebarOpen }) {
  const [role, setRole] = useState("Admin");
  const [openDropdowns, setOpenDropdowns] = useState({});

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

  // ✅ Sidebar menu config
  const menuItems = [
    {
      title: "Main",
      items: [
        {
          name: "Dashboard",
          icon: <LayoutDashboard size={18} />,
          path: "/dashboard",
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          name: "Booking Management",
          icon: <ClipboardList size={18} />,
          children: [
            { name: "Bookings", path: "/bookings" },
            { name: "Programs", path: "/programs" },
            { name: "Services", path: "/services" },
          ],
        },
        {
          name: "Blog Management",
          icon: <BookOpen size={18} />,
          children: [{ name: "Blogs", path: "/blogs" }],
        },
        {
          name: "Contact Management",
          icon: <MessageSquare size={18} />,
          children: [
            { name: "Contacts", path: "/contacts" },
            { name: "Child Issues", path: "/child-issues" },
          ],
        },
        {
          name: "Suggestion Management",
          icon: <MessageSquare size={18} />,
          children: [{ name: "Suggestions", path: "/suggestions" }],
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          name: "Role & Permission",
          icon: <Settings size={18} />,
          path: "/roles",
        },
        {
          name: "Backend Users",
          icon: <Users size={18} />,
          path: "/backendUsers",
        },
      ],
    },
  ];

  // ✅ Dropdown toggle logic
  const toggleDropdown = (menuName) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:static z-40 bg-white shadow-md w-64 min-h-full flex flex-col transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-indigo-600">{role}</h2>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">
          {menuItems.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {section.title}
              </h3>

              <div className="space-y-1">
                {section.items.map((item, idx) => {
                  const hasChildren = !!item.children;
                  const isOpen = openDropdowns[item.name];

                  return (
                    <div key={idx}>
                      {/* ✅ Parent item */}
                      {hasChildren ? (
                        <div
                          onClick={() => toggleDropdown(item.name)}
                          className={`flex items-center justify-between px-4 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 ${
                            isOpen
                              ? "bg-indigo-100 text-indigo-700"
                              : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {item.icon}
                            <span>{item.name}</span>
                          </div>
                          {isOpen ? (
                            <ChevronDown size={16} className="text-gray-500" />
                          ) : (
                            <ChevronRight size={16} className="text-gray-500" />
                          )}
                        </div>
                      ) : (
                        /* ✅ Direct navigation item */
                        <NavLink
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isActive
                                ? "bg-indigo-100 text-indigo-700"
                                : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                            }`
                          }
                        >
                          {item.icon}
                          <span>{item.name}</span>
                        </NavLink>
                      )}

                      {/* ✅ Dropdown children */}
                      {hasChildren && isOpen && (
                        <div className="ml-10 mt-1 space-y-1 border-l border-gray-200 pl-3">
                          {item.children.map((child, cIdx) => (
                            <NavLink
                              key={cIdx}
                              to={child.path}
                              onClick={() => setSidebarOpen(false)}
                              className={({ isActive }) =>
                                `block px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                                  isActive
                                    ? "bg-indigo-100 text-indigo-700 font-medium"
                                    : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                                }`
                              }
                            >
                              {child.name}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

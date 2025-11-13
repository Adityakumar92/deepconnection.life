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
import { useSelector } from "react-redux";

export default function SideBar({ sidebarOpen, setSidebarOpen }) {
  const [role, setRole] = useState("Admin");
  const [openDropdowns, setOpenDropdowns] = useState({});
  const { roleAndPermission } = useSelector((state) => state.auth);

  useEffect(() => {
    try {
      const authData = localStorage.getItem("authData");
      if (authData) {
        const user = JSON.parse(authData).user;
        setRole(user.role || "Admin");
      }
    } catch (error) {
      console.error("Failed to parse user data:", error);
    }
  }, []);

  // ✅ Sidebar menu configuration
  const menuItems = [
    {
      title: "Main",
      items: [
        {
          name: "Dashboard",
          icon: <LayoutDashboard size={18} />,
          path: "/dashboard",
          view: roleAndPermission?.["dashboard"],
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
          view: roleAndPermission?.["bookingManagement"],
        },
        {
          name: "Blog Management",
          icon: <BookOpen size={18} />,
          children: [{ name: "Blogs", path: "/blogs" }],
          view: roleAndPermission?.["blogManagement"],
        },
        {
          name: "Contact Management",
          icon: <MessageSquare size={18} />,
          children: [
            { name: "Contacts", path: "/contacts" },
            { name: "Child Issues", path: "/child-issues" },
          ],
          view: roleAndPermission?.["contactUsManagement"],
        },
        {
          name: "Suggestion Management",
          icon: <MessageSquare size={18} />,
          children: [{ name: "Suggestions", path: "/suggestions" }],
          view: roleAndPermission?.["suggestionsManagement"],
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
          view: roleAndPermission?.["roleAndPermissionManagement"],
        },
        {
          name: "Backend Users",
          icon: <Users size={18} />,
          path: "/backendUsers",
          view: roleAndPermission?.["backendUserManagement"],
        },
      ],
    },
  ];

  // ✅ Toggle dropdowns
  const toggleDropdown = (menuName) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  // ✅ Filter visible items (only if view !== 0)
  const filteredMenu = menuItems.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.view && item.view !== 0),
  }));

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
          {filteredMenu.map((section, sectionIdx) => (
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
                      {/* Parent item */}
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
                        /* Direct item */
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

                      {/* Dropdown Children */}
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

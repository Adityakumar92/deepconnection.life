import React, { useEffect, useState, useMemo, Fragment } from "react";
import DataTable from "react-data-table-component";
import api from "../../api/api";
import { toast } from "react-toastify";
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Plus,
  Loader2,
  X,
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";

export default function RoleMAnagement() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ role: "" });
  const [actionModal, setActionModal] = useState({ type: null, data: null });
  const [formData, setFormData] = useState({
    role: "",
    dashboard: 0,
    bookingManagement: 0,
    blogManagement: 0,
    contactUsManagement: 0,
  });


  // ✅ Fetch all roles
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const body = filters.role ? { role: filters.role } : {};
      const { data } = await api.post("/api/admin/role-permission/all", body);
      if (data.success) setRoles(data.roles);
    } catch (err) {
      toast.error("Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // ✅ Debounce filter (for search)
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchRoles();
    }, 500);
    return () => clearTimeout(delay);
  }, [filters]);

  // ✅ Create or Update Role
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (actionModal.type === "edit") {
        await api.patch(`/api/admin/role-permission/${actionModal.data._id}`, formData);
        toast.success("Role updated successfully");
      } else {
        await api.post("/api/admin/role-permission", formData);
        toast.success("Role created successfully");
      }
      setActionModal({ type: null, data: null });
      fetchRoles();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete Role
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      const { data } = await api.delete(`/api/admin/role-permission/${id}`);
      if (data.success) {
        toast.success("Role deleted successfully");
        fetchRoles();
      }
    } catch {
      toast.error("Failed to delete role");
    }
  };


  const permissionLabels = {
    0: "None",
    1: "View",
    2: "Edit",
    3: "Delete",
    4: "All",
  };


  // ✅ Table Columns
  const columns = useMemo(
    () => [
      { name: "Role Name", selector: (row) => row.role, sortable: true },
      {
        name: "Dashboard",
        selector: (row) => permissionLabels[row.dashboard] || "None",
      },
      {
        name: "Booking",
        selector: (row) =>
          permissionLabels[row.bookingManagement] || "None",
      },
      {
        name: "Blog",
        selector: (row) => permissionLabels[row.blogManagement] || "None",
      },
      {
        name: "Contact",
        selector: (row) =>
          permissionLabels[row.contactUsManagement] || "None",
      },
      {
        name: "Actions",
        cell: (row) => (
          <RowActions
            row={row}
            onView={() => setActionModal({ type: "view", data: row })}
            onEdit={() => {
              setFormData({
                role: row.role,
                dashboard: row.dashboard,
                bookingManagement: row.bookingManagement,
                blogManagement: row.blogManagement,
                contactUsManagement: row.contactUsManagement,
              });
              setActionModal({ type: "edit", data: row });
            }}
            onDelete={() => handleDelete(row._id)}
          />
        ),
        ignoreRowClick: true,
        button: true,
      },
    ],
    []
  );


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-indigo-500 to-purple-500 p-5 rounded-xl shadow-md text-white">
        <h1 className="text-xl font-semibold">Role & Permission Management</h1>
        <button
          onClick={() => {
            setFormData({
              role: "",
              dashboard: 0,
              bookingManagement: 0,
              blogManagement: 0,
              contactUsManagement: 0,
            });
            setActionModal({ type: "create", data: null });
          }}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <Plus size={18} /> Create Role
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="text-sm font-medium text-gray-600">Filters:</div>
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search by role name..."
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
        {filters.role && (
          <button
            onClick={() => setFilters({ role: "" })}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm"
          >
            <X size={16} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border">
        <DataTable
          columns={columns}
          data={roles}
          pagination
          highlightOnHover
          progressPending={loading}
          paginationPerPage={8}
          customStyles={{
            headCells: {
              style: {
                backgroundColor: "#f9fafb",
                fontWeight: "600",
                color: "#374151",
              },
            },
          }}
        />
      </div>

      {/* Modal */}
      <Transition appear show={!!actionModal.type} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setActionModal({ type: null, data: null })}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6 space-y-4">
              {/* Header */}
              <div className="flex justify-between items-center border-b pb-2">
                <Dialog.Title className="text-lg font-semibold text-gray-800">
                  {actionModal.type === "view" && "Role Details"}
                  {actionModal.type === "edit" && "Edit Role"}
                  {actionModal.type === "create" && "Create New Role"}
                </Dialog.Title>
                <button
                  onClick={() => setActionModal({ type: null, data: null })}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              {actionModal.type === "view" ? (
                <ViewRole role={actionModal.data} />
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Role Name
                    </label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  {/* Permission Inputs */}
                  {[
                    "dashboard",
                    "bookingManagement",
                    "blogManagement",
                    "contactUsManagement",
                  ].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                        {field.replace(/([A-Z])/g, " $1")}
                      </label>
                      <select
                        value={formData[field]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field]: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value={0}>None</option>
                        <option value={1}>View</option>
                        <option value={2}>Edit</option>
                        <option value={3}>Delete</option>
                        <option value={4}>All</option>
                      </select>
                    </div>
                  ))}

                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </button>
                </form>
              )}
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

// ✅ Row Actions
const RowActions = ({ row, onView, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const handleToggle = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX - 100,
    });
    setOpen((p) => !p);
  };

  useEffect(() => {
    const close = () => setOpen(false);
    if (open) document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <>
      <button onClick={handleToggle} className="p-1 hover:bg-gray-100 rounded-md">
        <MoreVertical size={18} />
      </button>

      {open && (
        <div
          className="fixed bg-white shadow-lg border rounded-lg z-[9999] w-44 animate-fadeIn"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          <button
            onClick={onView}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
          >
            <Eye size={16} /> View
          </button>
          <button
            onClick={onEdit}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
          >
            <Edit size={16} /> Edit
          </button>
          <button
            onClick={onDelete}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      )}
    </>
  );
};

// ✅ View Role Details
const ViewRole = ({ role }) => (
  <div className="space-y-3 text-gray-700">
    <p><strong>Role:</strong> {role?.role}</p>
    <p><strong>Dashboard:</strong> {role?.dashboard}</p>
    <p><strong>Booking Management:</strong> {role?.bookingManagement}</p>
    <p><strong>Blog Management:</strong> {role?.blogManagement}</p>
    <p><strong>Contact Us Management:</strong> {role?.contactUsManagement}</p>
  </div>
);

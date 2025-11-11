import React, { useEffect, useState, useMemo, Fragment } from "react";
import DataTable from "react-data-table-component";
import api from "../../api/api";
import { toast } from "react-toastify";
import {
  MoreVertical,
  Eye,
  Edit,
  Ban,
  Trash2,
  Plus,
  Loader2,
  X,
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";

export default function BackendUser() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ name: "", role: "", block: "" });
  const [modal, setModal] = useState({ type: null, data: null });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    roleId: "",
  });

  /* --------------------------- API CALLS --------------------------- */

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const body = {
        name: filters.name || undefined,
        role: filters.role || undefined,
        block: filters.block || undefined,
      };
      const { data } = await api.post("/api/admin/backend-user/all", body);
      if (data.success) setUsers(data.users);
      else toast.error(data.message || "Failed to fetch users");
    } catch {
      toast.error("Server error while fetching users");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data } = await api.post("/api/admin/role-permission/all");
      setRoles(data.roles || []);
    } catch {
      toast.error("Failed to fetch roles");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // Debounced refetch when filters change
  useEffect(() => {
    const delay = setTimeout(fetchUsers, 500);
    return () => clearTimeout(delay);
  }, [filters]);

  /* --------------------------- CRUD HANDLERS --------------------------- */

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const { data } = await api.delete(`/api/admin/backend-user/${id}`);
      if (data.success) {
        toast.success("User deleted successfully");
        fetchUsers();
      }
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleBlock = async (user) => {
    try {
      const { data } = await api.patch(`/api/admin/backend-user/${user._id}`, {
        block: !user.block,
      });
      if (data.success) {
        toast.success(
          `User ${user.block ? "unblocked" : "blocked"} successfully`
        );
        fetchUsers();
      }
    } catch {
      toast.error("Failed to update user status");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url =
        modal.type === "edit"
          ? `/api/admin/backend-user/${modal.data._id}`
          : "/api/admin/backend-user";
      const method = modal.type === "edit" ? api.patch : api.post;

      await method(url, formData);
      toast.success(
        `User ${modal.type === "edit" ? "updated" : "created"} successfully`
      );
      setModal({ type: null, data: null });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving user");
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------- TABLE CONFIG --------------------------- */

  const columns = useMemo(
    () => [
      { name: "Name", selector: (row) => row.name, sortable: true },
      { name: "Email", selector: (row) => row.email || "-", sortable: true },
      { name: "Phone", selector: (row) => row.phone || "-" },
      {
        name: "Role",
        selector: (row) => row.roleAndPermissionModel?.role || "—",
      },
      {
        name: "Status",
        cell: (row) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              row.block
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {row.block ? "Blocked" : "Active"}
          </span>
        ),
      },
      {
        name: "Actions",
        cell: (row) => (
          <RowActions
            row={row}
            onView={() => setModal({ type: "view", data: row })}
            onEdit={() => {
              setFormData({
                name: row.name,
                email: row.email,
                phone: row.phone,
                roleId: row.roleAndPermissionModel?._id || "",
              });
              setModal({ type: "edit", data: row });
            }}
            onBlock={() => handleBlock(row)}
            onDelete={() => handleDelete(row._id)}
          />
        ),
        ignoreRowClick: true,
      },
    ],
    []
  );

  /* --------------------------- RENDER --------------------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-indigo-500 to-purple-500 p-5 rounded-xl shadow-md text-white">
        <h1 className="text-xl font-semibold">Backend Users</h1>
        <button
          onClick={() => {
            setFormData({
              name: "",
              email: "",
              phone: "",
              password: "",
              roleId: "",
            });
            setModal({ type: "create", data: null });
          }}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <Plus size={18} /> Create User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="text-sm font-medium text-gray-600">Filters:</div>

        {/* Name Filter */}
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search by name..."
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>

        {/* Role Filter */}
        <select
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          className="w-full md:w-1/4 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="">All Roles</option>
          {roles.map((r) => (
            <option key={r._id} value={r.role}>
              {r.role}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filters.block}
          onChange={(e) => setFilters({ ...filters, block: e.target.value })}
          className="w-full md:w-1/4 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="">All Users</option>
          <option value="true">Blocked</option>
          <option value="false">Active</option>
        </select>

        {/* Clear Filters */}
        {(filters.name || filters.role || filters.block) && (
          <button
            onClick={() => setFilters({ name: "", role: "", block: "" })}
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
          data={users}
          pagination
          highlightOnHover
          progressPending={loading}
          paginationPerPage={8}
        />
      </div>

      {/* Modal */}
      <UserModal
        modal={modal}
        setModal={setModal}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        loading={loading}
        roles={roles}
      />
    </div>
  );
}

/* --------------------------- COMPONENTS --------------------------- */

// ✅ Modal (Create / Edit / View)
const UserModal = ({
  modal,
  setModal,
  formData,
  setFormData,
  handleSubmit,
  loading,
  roles,
}) => (
  <Transition appear show={!!modal.type} as={Fragment}>
    <Dialog
      as="div"
      className="relative z-50"
      onClose={() => setModal({ type: null, data: null })}
    >
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
      >
        <div className="fixed inset-0 bg-black/50" />
      </Transition.Child>

      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-2">
            <Dialog.Title className="text-lg font-semibold text-gray-800">
              {modal.type === "view" && "User Details"}
              {modal.type === "edit" && "Edit User"}
              {modal.type === "create" && "Create New User"}
            </Dialog.Title>
            <button
              onClick={() => setModal({ type: null, data: null })}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          {modal.type === "view" ? (
            <ViewUser user={modal.data} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["name", "email", "phone"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                      {field}
                    </label>
                    <input
                      type="text"
                      name={field}
                      value={formData[field]}
                      onChange={(e) =>
                        setFormData({ ...formData, [field]: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}

                {modal.type !== "edit" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Role
                  </label>
                  <select
                    name="roleId"
                    value={formData.roleId}
                    onChange={(e) =>
                      setFormData({ ...formData, roleId: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Role</option>
                    {roles.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Save"}
              </button>
            </form>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  </Transition>
);

// ✅ View User (Modal Content)
const ViewUser = ({ user }) => (
  <div className="space-y-3 text-gray-700">
    <p><strong>Name:</strong> {user?.name}</p>
    <p><strong>Email:</strong> {user?.email || "—"}</p>
    <p><strong>Phone:</strong> {user?.phone || "—"}</p>
    <p><strong>Role:</strong> {user?.roleAndPermissionModel?.role || "—"}</p>
    <p>
      <strong>Status:</strong>{" "}
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          user?.block ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
        }`}
      >
        {user?.block ? "Blocked" : "Active"}
      </span>
    </p>
  </div>
);

// ✅ Row Actions Dropdown
const RowActions = ({ row, onView, onEdit, onBlock, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const toggleMenu = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + window.scrollY + 5,
      left: Math.min(rect.left + window.scrollX - 120, window.innerWidth - 180),
    });
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    const close = () => setOpen(false);
    if (open) document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <>
      <button
        onClick={toggleMenu}
        className="p-1 hover:bg-gray-100 rounded-md transition"
        aria-label="More actions"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div
          className="fixed bg-white border rounded-lg shadow-lg z-[99999] w-44 py-1 animate-fadeIn"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          <MenuItem icon={<Eye size={16} />} label="View" onClick={onView} />
          <MenuItem icon={<Edit size={16} />} label="Edit" onClick={onEdit} />
          <MenuItem
            icon={<Ban size={16} />}
            label={row.block ? "Unblock" : "Block"}
            onClick={onBlock}
          />
          <MenuItem
            icon={<Trash2 size={16} />}
            label="Delete"
            onClick={onDelete}
            danger
          />
        </div>
      )}
    </>
  );
};

// ✅ Menu Item Helper
const MenuItem = ({ icon, label, onClick, danger = false }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
      danger ? "text-red-600 hover:bg-red-50" : "hover:bg-gray-50 text-gray-700"
    }`}
  >
    {icon} {label}
  </button>
);

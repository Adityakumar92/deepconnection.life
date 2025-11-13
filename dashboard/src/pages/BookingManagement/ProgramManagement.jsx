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
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { useSelector } from "react-redux";

export default function ProgramManagement() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ name: "", status: "" });
  const [modal, setModal] = useState({ type: null, data: null });
  const [formData, setFormData] = useState({ name: "", status: true });

  const { roleAndPermission } = useSelector((state) => state.auth);
  const permissionLevel = roleAndPermission?.["bookingManagement"] || 0;

  /* --------------------------- FETCH PROGRAMS --------------------------- */
  const fetchPrograms = async () => {
  setLoading(true);
  try {
    const body = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) body[key] = value;
    }

    const { data } = await api.post("/api/admin/program/all", body);
    if (data.success) {
      setPrograms(data.programs || []); // ✅ Correct key
    } else {
      toast.error(data.message || "Failed to fetch programs");
    }
  } catch {
    toast.error("Server error while fetching programs");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    const delay = setTimeout(fetchPrograms, 600);
    return () => clearTimeout(delay);
  }, [filters]);

  /* --------------------------- CRUD --------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const url =
        modal.type === "edit"
          ? `/api/admin/program/${modal.data._id}`
          : "/api/admin/program";
      const method = modal.type === "edit" ? api.patch : api.post;

      await method(url, formData);
      toast.success(
        `Program ${modal.type === "edit" ? "updated" : "created"} successfully`
      );
      setModal({ type: null, data: null });
      fetchPrograms();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving program");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this program?")) return;
    try {
      const { data } = await api.delete(`/api/admin/program/${id}`);
      if (data.success) {
        toast.success("Program deleted successfully");
        fetchPrograms();
      }
    } catch {
      toast.error("Failed to delete program");
    }
  };

  const handleToggleStatus = async (program) => {
    try {
      const { data } = await api.patch(`/api/admin/program/${program._id}`, {
        status: !program.status,
      });
      if (data.success) {
        toast.success("Program status updated");
        fetchPrograms();
      }
    } catch {
      toast.error("Failed to update program status");
    }
  };

  /* --------------------------- TABLE CONFIG --------------------------- */
  const columns = useMemo(
    () => [
      { name: "Name", selector: (row) => row.name, sortable: true },
      {
        name: "Status",
        cell: (row) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              row.status
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {row.status ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        name: "Actions",
        cell: (row) => (
          <RowActions
            permissionLevel={permissionLevel}
            row={row}
            onView={() => setModal({ type: "view", data: row })}
            onEdit={() => {
              setFormData({
                name: row.name,
                status: row.status,
              });
              setModal({ type: "edit", data: row });
            }}
            onDelete={() => handleDelete(row._id)}
            onToggleStatus={() => handleToggleStatus(row)}
          />
        ),
        ignoreRowClick: true,
      },
    ],
    [permissionLevel]
  );

  /* --------------------------- RENDER --------------------------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-indigo-500 to-purple-500 p-5 rounded-xl shadow-md text-white">
        <h1 className="text-xl font-semibold">Program Management</h1>
        {permissionLevel >= 2 && (
          <button
            onClick={() => {
              setFormData({ name: "", status: true });
              setModal({ type: "create", data: null });
            }}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Plus size={18} /> Create Program
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="text-sm font-medium text-gray-600">Filters:</div>

        <input
          type="text"
          placeholder="Search by Name..."
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          className="w-full md:w-1/3 px-3 py-2 border rounded-lg text-sm"
        />

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="w-full md:w-1/5 px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">All Programs</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        {(Object.values(filters).some((v) => v)) && (
          <button
            onClick={() => setFilters({ name: "", status: "" })}
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
          data={programs}
          pagination
          highlightOnHover
          progressPending={loading}
          paginationPerPage={8}
        />
      </div>

      {/* Modal */}
      <ProgramModal
        modal={modal}
        setModal={setModal}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}

/* --------------------------- ROW ACTIONS --------------------------- */
const RowActions = ({
  row,
  permissionLevel,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
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

  const canView = permissionLevel >= 1;
  const canEdit = permissionLevel >= 2;
  const canDelete = permissionLevel >= 3;
  const canToggle = permissionLevel >= 4;

  return (
    <>
      <button
        onClick={toggleMenu}
        className="p-1 hover:bg-gray-100 rounded-md transition"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div
          className="fixed bg-white border rounded-lg shadow-lg z-[99999] w-44 py-1"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          {canView && <MenuItem icon={<Eye size={16} />} label="View" onClick={onView} />}
          {canEdit && <MenuItem icon={<Edit size={16} />} label="Edit" onClick={onEdit} />}
          {canToggle && (
            <MenuItem
              icon={row.status ? <XCircle size={16} /> : <CheckCircle size={16} />}
              label={row.status ? "Deactivate" : "Activate"}
              onClick={onToggleStatus}
            />
          )}
          {canDelete && (
            <MenuItem icon={<Trash2 size={16} />} label="Delete" onClick={onDelete} danger />
          )}
        </div>
      )}
    </>
  );
};

const MenuItem = ({ icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
      danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
    }`}
  >
    {icon} {label}
  </button>
);

/* --------------------------- MODAL --------------------------- */
const ProgramModal = ({
  modal,
  setModal,
  formData,
  setFormData,
  handleSubmit,
  loading,
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
        <Dialog.Panel className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <Dialog.Title className="text-lg font-semibold text-gray-800">
              {modal.type === "view" && "View Program"}
              {modal.type === "edit" && "Edit Program"}
              {modal.type === "create" && "Create Program"}
            </Dialog.Title>
            <button
              onClick={() => setModal({ type: null, data: null })}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>

          {modal.type === "view" ? (
            <ViewProgram program={modal.data} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Program Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value === "true" })
                  }
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
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
);

/* --------------------------- VIEW PROGRAM --------------------------- */
const ViewProgram = ({ program }) => (
  <div className="space-y-3 text-gray-700">
    <p><strong>Name:</strong> {program?.name}</p>
    <p>
      <strong>Status:</strong>{" "}
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          program?.status
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {program?.status ? "Active" : "Inactive"}
      </span>
    </p>
    <p><strong>Created:</strong> {new Date(program?.createdAt).toLocaleString()}</p>
  </div>
);

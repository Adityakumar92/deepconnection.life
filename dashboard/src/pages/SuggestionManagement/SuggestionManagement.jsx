import React, { useEffect, useState, useMemo, Fragment } from "react";
import DataTable from "react-data-table-component";
import api from "../../api/api";
import { toast } from "react-toastify";
import { createPortal } from "react-dom";

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
import { useSelector } from "react-redux";

export default function SuggestionManagement() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    name: "",
    email: "",
    topic: "",
    search: "",
  });

  const [modal, setModal] = useState({ type: null, data: null });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "",
  });

  const { roleAndPermission } = useSelector((state) => state.auth);
  const permissionLevel = roleAndPermission?.["suggestionsManagement"] || 0;

  /* ---------------------------- FETCH DATA ---------------------------- */
  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const body = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v) body[k] = v;
      });

      const { data } = await api.post("/api/admin/suggestion/all", body);

      if (data.success) {
        setSuggestions(data.suggestions || []);
      }
    } catch {
      toast.error("Failed to fetch suggestions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  useEffect(() => {
    const delay = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(delay);
  }, [filters]);

  /* ---------------------------- CRUD ---------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url =
        modal.type === "edit"
          ? `/api/admin/suggestion/${modal.data._id}`
          : "/api/admin/suggestion";

      const method = modal.type === "edit" ? api.patch : api.post;

      await method(url, formData);

      toast.success(
        modal.type === "edit"
          ? "Suggestion updated successfully"
          : "Suggestion created successfully"
      );

      setModal({ type: null, data: null });
      fetchSuggestions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save suggestion");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this suggestion?"))
      return;

    try {
      const { data } = await api.delete(`/api/admin/suggestion/${id}`);

      if (data.success) {
        toast.success("Suggestion deleted");
        fetchSuggestions();
      }
    } catch {
      toast.error("Failed to delete suggestion");
    }
  };

  /* ---------------------------- TABLE COLUMNS ---------------------------- */
  const columns = useMemo(
    () => [
      { name: "Name", selector: (row) => row.name },
      { name: "Email", selector: (row) => row.email },
      { name: "Topic", selector: (row) => row.topic },

      {
        name: "Actions",
        cell: (row) => (
          <RowActions
            row={row}
            permissionLevel={permissionLevel}
            onView={() => setModal({ type: "view", data: row })}
            onEdit={() => {
              setFormData({
                name: row.name,
                email: row.email,
                topic: row.topic,
              });
              setModal({ type: "edit", data: row });
            }}
            onDelete={() => handleDelete(row._id)}
          />
        ),
      },
    ],
    [permissionLevel]
  );

  /* ---------------------------- RENDER ---------------------------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-indigo-500 to-purple-500 p-5 rounded-xl text-white">
        <h1 className="text-xl font-semibold">Suggestion Management</h1>

        {permissionLevel >= 2 && (
          <button
            onClick={() => {
              setFormData({ name: "", email: "", topic: "" });
              setModal({ type: "create", data: null });
            }}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg"
          >
            <Plus size={18} /> Create Suggestion
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 shadow-sm flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Name..."
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          className="px-3 py-2 border rounded-md w-full md:w-1/4"
        />

        <input
          type="text"
          placeholder="Email..."
          value={filters.email}
          onChange={(e) => setFilters({ ...filters, email: e.target.value })}
          className="px-3 py-2 border rounded-md w-full md:w-1/4"
        />

        <input
          type="text"
          placeholder="Topic..."
          value={filters.topic}
          onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
          className="px-3 py-2 border rounded-md w-full md:w-1/4"
        />

        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="px-3 py-2 border rounded-md w-full md:w-1/4"
        />

        {Object.values(filters).some((v) => v) && (
          <button
            onClick={() =>
              setFilters({ name: "", email: "", topic: "", search: "" })
            }
            className="px-3 py-2 bg-gray-100 rounded-md"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border shadow-md">
        <DataTable
          columns={columns}
          data={suggestions}
          pagination
          highlightOnHover
          progressPending={loading}
          paginationPerPage={8}
        />
      </div>

      {/* Modal */}
      <SuggestionModal
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

/* ---------------------------- ROW ACTIONS ---------------------------- */
const RowActions = ({ row, permissionLevel, onView, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const handleToggle = (e) => {
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 130;

    let top = rect.bottom + window.scrollY + 8;

    // If dropdown would go off screen → open upward
    if (top + dropdownHeight > window.innerHeight + window.scrollY) {
      top = rect.top + window.scrollY - dropdownHeight - 8;
    }

    setMenuPos({
      top,
      left: rect.left + window.scrollX - 100,
    });

    setOpen((prev) => !prev);
  };

  // Close when clicking outside or scrolling
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);

    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);

    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const dropdown = open ? (
    <div
      className="fixed bg-white border rounded-lg shadow-xl z-[999999] w-40 py-1"
      style={{ top: menuPos.top, left: menuPos.left }}
    >
      {permissionLevel >= 1 && (
        <MenuItem icon={<Eye size={16} />} label="View" onClick={onView} />
      )}

      {permissionLevel >= 2 && (
        <MenuItem icon={<Edit size={16} />} label="Edit" onClick={onEdit} />
      )}

      {permissionLevel >= 3 && (
        <MenuItem
          icon={<Trash2 size={16} />}
          label="Delete"
          danger
          onClick={onDelete}
        />
      )}
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={handleToggle}
        className="p-1 hover:bg-gray-100 rounded-md transition"
      >
        <MoreVertical size={18} />
      </button>

      {createPortal(dropdown, document.body)}
    </>
  );
};

const MenuItem = ({ icon, label, danger, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${
      danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
    }`}
  >
    {icon} {label}
  </button>
);

/* ---------------------------- MODAL ---------------------------- */
const SuggestionModal = ({
  modal,
  setModal,
  formData,
  setFormData,
  handleSubmit,
  loading,
}) => (
  <Transition show={!!modal.type} as={Fragment}>
    <Dialog onClose={() => setModal({ type: null, data: null })} className="relative z-50">
      <Transition.Child
        enter="duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
      >
        <div className="fixed inset-0 bg-black/50" />
      </Transition.Child>

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-semibold">
              {modal.type === "create" && "Create Suggestion"}
              {modal.type === "edit" && "Edit Suggestion"}
              {modal.type === "view" && "View Suggestion"}
            </h2>
            <button onClick={() => setModal({ type: null, data: null })}>
              <X size={18} />
            </button>
          </div>

          {modal.type === "view" ? (
            <ViewSuggestion suggestion={modal.data} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg"
              />

              <input
                type="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg"
              />

              <input
                type="text"
                placeholder="Topic"
                required
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg"
              />

              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg flex items-center gap-2"
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

/* ---------------------------- VIEW PANEL ---------------------------- */
const ViewSuggestion = ({ suggestion }) => (
  <div className="space-y-3">
    <p><strong>Name:</strong> {suggestion?.name}</p>
    <p><strong>Email:</strong> {suggestion?.email}</p>
    <p><strong>Topic:</strong> {suggestion?.topic}</p>
  </div>
);

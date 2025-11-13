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
import { useSelector } from "react-redux";

export default function ContactManagement() {
  const [contacts, setContacts] = useState([]);
  const [childIssues, setChildIssues] = useState([]);

  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    childIssue: "",
    search: "",
  });

  const [modal, setModal] = useState({ type: null, data: null });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    childIssue: "",
    message: "",
    website: "0",
  });

  const { roleAndPermission } = useSelector((state) => state.auth);
  const permissionLevel = roleAndPermission?.["contactUsManagement"] || 0;

  /* --------------------------- FETCH CONTACTS --------------------------- */
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const body = {};
      for (const [k, v] of Object.entries(filters)) {
        if (v) body[k] = v;
      }

      const { data } = await api.post("/api/admin/contact-us/all", body);

      if (data.success) {
        setContacts(data.contacts || []);
      } else toast.error(data.message || "Failed to fetch contacts");
    } catch (err) {
      toast.error("Error fetching contacts");
    } finally {
      setLoading(false);
    }
  };

  const fetchChildIssues = async () => {
    try {
      const { data } = await api.post("/api/admin/child-issue/all", {});
      if (data.success) setChildIssues(data.services);
    } catch {
      toast.error("Failed to fetch child issues");
    }
  };

  useEffect(() => {
    fetchContacts();
    fetchChildIssues();
  }, []);

  useEffect(() => {
    const delay = setTimeout(fetchContacts, 500);
    return () => clearTimeout(delay);
  }, [filters]);

  /* --------------------------- CRUD --------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url =
        modal.type === "edit"
          ? `/api/admin/contact-us/${modal.data._id}`
          : "/api/admin/contact-us";

      const method = modal.type === "edit" ? api.patch : api.post;

      await method(url, formData);

      toast.success(
        `Contact ${modal.type === "edit" ? "updated" : "created"} successfully`
      );

      setModal({ type: null, data: null });
      fetchContacts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save contact");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;

    try {
      const { data } = await api.delete(`/api/admin/contact-us/${id}`);
      if (data.success) {
        toast.success("Contact deleted successfully");
        fetchContacts();
      }
    } catch {
      toast.error("Failed to delete contact");
    }
  };

  /* --------------------------- TABLE COLUMNS --------------------------- */
  const columns = useMemo(
    () => [
      { name: "Name", selector: (r) => r.name },
      { name: "Email", selector: (r) => r.email },
      { name: "Phone", selector: (r) => r.phone },
      {
        name: "Issue",
        selector: (r) => r.childIssue?.name || "—",
      },
      {
        name: "Website",
        cell: (row) => (
          <span>
            {row.website === 0 ? "DeepConnection" : "Kiddicove"}
          </span>
        ),
      },
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
                phone: row.phone,
                email: row.email,
                childIssue: row.childIssue?._id,
                message: row.message,
                website: row.website,
              });
              setModal({ type: "edit", data: row });
            }}
            onDelete={() => handleDelete(row._id)}
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
        <h1 className="text-xl font-semibold">Contact Management</h1>

        {permissionLevel >= 2 && (
          <button
            onClick={() => {
              setFormData({
                name: "",
                phone: "",
                email: "",
                childIssue: "",
                message: "",
                website: "0",
              });
              setModal({ type: "create", data: null });
            }}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition"
          >
            <Plus size={18} /> Create Contact
          </button>
        )}
      </div>

      {/* Filters */}
      {/* Filters */}
<div className="bg-white border rounded-lg shadow-sm p-4 flex flex-wrap gap-3">
  
  {/* Name */}
  <input
    type="text"
    placeholder="Name..."
    value={filters.name}
    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
    className="px-3 py-2 border rounded-md w-full md:w-1/5"
  />

  {/* Email */}
  <input
    type="text"
    placeholder="Email..."
    value={filters.email}
    onChange={(e) => setFilters({ ...filters, email: e.target.value })}
    className="px-3 py-2 border rounded-md w-full md:w-1/5"
  />

  {/* Phone */}
  <input
    type="text"
    placeholder="Phone..."
    value={filters.phone}
    onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
    className="px-3 py-2 border rounded-md w-full md:w-1/5"
  />

  {/* Website Filter */}
  <select
    value={filters.website}
    onChange={(e) =>
      setFilters({ ...filters, website: e.target.value })
    }
    className="px-3 py-2 border rounded-md w-full md:w-1/6"
  >
    <option value="">All Websites</option>
    <option value="0">DeepConnection</option>
    <option value="1">Kiddicove</option>
  </select>

  {/* Child Issue Filter */}
  <select
    value={filters.childIssue}
    onChange={(e) =>
      setFilters({ ...filters, childIssue: e.target.value })
    }
    className="px-3 py-2 border rounded-md w-full md:w-1/6"
  >
    <option value="">All Issues</option>
    {childIssues.map((i) => (
      <option key={i._id} value={i._id}>
        {i.name}
      </option>
    ))}
  </select>

  {/* Clear Button */}
  {(Object.values(filters).some((v) => v)) && (
    <button
      onClick={() =>
        setFilters({
          name: "",
          email: "",
          phone: "",
          website: "",
          childIssue: "",
          search: "",
        })
      }
      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
    >
      <X size={16} />
    </button>
  )}
</div>


      {/* Table */}
      <div className="bg-white rounded-lg border shadow-md">
        <DataTable
          columns={columns}
          data={contacts}
          pagination
          highlightOnHover
          progressPending={loading}
          paginationPerPage={8}
        />
      </div>

      {/* Modal */}
      <ContactModal
        modal={modal}
        setModal={setModal}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        loading={loading}
        childIssues={childIssues}
      />
    </div>
  );
}

/* --------------------------- ROW ACTIONS --------------------------- */
const RowActions = ({ row, permissionLevel, onView, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const toggle = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX - 120,
    });
    setOpen(!open);
  };

  return (
    <>
      <button onClick={toggle} className="p-1 hover:bg-gray-100 rounded-md">
        <MoreVertical size={18} />
      </button>

      {open && (
        <div
          className="fixed bg-white border rounded-lg shadow-lg z-[9999] w-44 py-1"
          style={{ top: pos.top, left: pos.left }}
        >
          <MenuItem icon={<Eye size={16} />} label="View" onClick={onView} />

          {permissionLevel >= 2 && (
            <MenuItem icon={<Edit size={16} />} label="Edit" onClick={onEdit} />
          )}

          {permissionLevel >= 3 && (
            <MenuItem
              icon={<Trash2 size={16} />}
              label="Delete"
              onClick={onDelete}
              danger
            />
          )}
        </div>
      )}
    </>
  );
};

const MenuItem = ({ icon, label, onClick, danger }) => (
  <button
    className={`w-full px-3 py-2 text-sm flex items-center gap-2 ${
      danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
    }`}
    onClick={onClick}
  >
    {icon} {label}
  </button>
);

/* --------------------------- MODAL --------------------------- */
const ContactModal = ({
  modal,
  setModal,
  formData,
  setFormData,
  handleSubmit,
  loading,
  childIssues,
}) => (
  <Transition appear show={!!modal.type} as={Fragment}>
    <Dialog
      as="div"
      className="relative z-50"
      onClose={() => setModal({ type: null, data: null })}
    >
      <Transition.Child as={Fragment} enter="duration-200" enterFrom="opacity-0" enterTo="opacity-100">
        <div className="fixed inset-0 bg-black/50" />
      </Transition.Child>

      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="bg-white w-full max-w-2xl rounded-xl shadow-xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <Dialog.Title className="text-lg font-semibold">
              {modal.type === "create" && "Create Contact"}
              {modal.type === "edit" && "Edit Contact"}
              {modal.type === "view" && "View Contact"}
            </Dialog.Title>

            <button
              onClick={() => setModal({ type: null, data: null })}
              className="text-gray-600 hover:text-gray-800"
            >
              <X size={18} />
            </button>
          </div>

          {modal.type === "view" ? (
            <ViewContact contact={modal.data} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2"
                />

                <input
                  type="text"
                  placeholder="Phone"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2"
                />

                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2"
                />

                <select
                  required
                  value={formData.childIssue}
                  onChange={(e) =>
                    setFormData({ ...formData, childIssue: e.target.value })
                  }
                  className="border rounded-lg px-3 py-2"
                >
                  <option value="">Select Child Issue</option>
                  {childIssues.map((i) => (
                    <option key={i._id} value={i._id}>
                      {i.name}
                    </option>
                  ))}
                </select>

                <select
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: Number(e.target.value) })
                  }
                  className="border rounded-lg px-3 py-2"
                >
                  <option value="0">DeepConnection</option>
                  <option value="1">Kiddicove</option>
                </select>
              </div>

              <textarea
                placeholder="Message"
                rows={4}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="border rounded-lg px-3 py-2 w-full"
              />

              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg flex items-center gap-2"
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

/* --------------------------- VIEW CONTACT --------------------------- */
const ViewContact = ({ contact }) => (
  <div className="space-y-3 text-gray-700">
    <p><strong>Name:</strong> {contact?.name}</p>
    <p><strong>Email:</strong> {contact?.email}</p>
    <p><strong>Phone:</strong> {contact?.phone}</p>
    <p><strong>Issue:</strong> {contact?.childIssue?.name}</p>
    <p><strong>Website:</strong> {contact?.website === 0 ? "DeepConnection" : "Kiddicove"}</p>
    <p><strong>Message:</strong> {contact?.message}</p>
    <p><strong>Created:</strong> {new Date(contact?.createdAt).toLocaleString()}</p>
  </div>
);

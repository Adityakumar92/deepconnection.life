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

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
    search: "",
  });

  const [modal, setModal] = useState({ type: null, data: null });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceType: "",
    programType: "",
    message: "",
    status: "pending",
  });

  const [services, setServices] = useState([]);
  const [programs, setPrograms] = useState([]);

  const { roleAndPermission } = useSelector((state) => state.auth);
  const permissionLevel = roleAndPermission?.["bookingManagement"] || 0;

  /* --------------------------- FETCH BOOKINGS --------------------------- */
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const body = {};
      for (const [key, value] of Object.entries(filters)) {
        if (value) body[key] = value;
      }

      const { data } = await api.post("/api/admin/booking/all", body);
      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        toast.error(data.message || "Failed to fetch bookings");
      }
    } catch {
      toast.error("Server error while fetching bookings");
    } finally {
      setLoading(false);
    }
  };

  const fetchServicesAndPrograms = async () => {
    try {
      const [servicesRes, programsRes] = await Promise.all([
        api.post("/api/admin/service/all", {}),
        api.post("/api/admin/program/all", {}),
      ]);
      if (servicesRes.data.success) setServices(servicesRes.data.services);
      if (programsRes.data.success) setPrograms(programsRes.data.programs);
    } catch (err) {
      toast.error("Error fetching dropdown data");
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchServicesAndPrograms();
  }, []);

  useEffect(() => {
    const delay = setTimeout(fetchBookings, 600);
    return () => clearTimeout(delay);
  }, [filters]);

  /* --------------------------- CRUD --------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const url =
        modal.type === "edit"
          ? `/api/admin/booking/${modal.data._id}`
          : "/api/admin/booking";
      const method = modal.type === "edit" ? api.patch : api.post;

      await method(url, formData);
      toast.success(
        `Booking ${modal.type === "edit" ? "updated" : "created"} successfully`
      );
      setModal({ type: null, data: null });
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving booking");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      const { data } = await api.delete(`/api/admin/booking/${id}`);
      if (data.success) {
        toast.success("Booking deleted successfully");
        fetchBookings();
      }
    } catch {
      toast.error("Failed to delete booking");
    }
  };

  /* --------------------------- TABLE CONFIG --------------------------- */
  const columns = useMemo(
    () => [
      { name: "Name", selector: (row) => row.name, sortable: true },
      { name: "Email", selector: (row) => row.email },
      { name: "Phone", selector: (row) => row.phone },
      {
        name: "Service",
        selector: (row) => row.serviceType?.name || "—",
      },
      {
        name: "Program",
        selector: (row) => row.programType?.name || "—",
      },
      {
        name: "Status",
        selector: (row) => row.status,
        cell: (row) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              row.status === "approved"
                ? "bg-green-100 text-green-700"
                : row.status === "rejected"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {row.status}
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
                email: row.email,
                phone: row.phone,
                serviceType: row.serviceType?._id || "",
                programType: row.programType?._id || "",
                message: row.message,
                status: row.status,
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
        <h1 className="text-xl font-semibold">Booking Management</h1>
        {permissionLevel >= 2 && (
          <button
            onClick={() => {
              setFormData({
                name: "",
                email: "",
                phone: "",
                serviceType: "",
                programType: "",
                message: "",
                status: "pending",
              });
              setModal({ type: "create", data: null });
            }}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Plus size={18} /> Create Booking
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="text-sm font-medium text-gray-600">Filters:</div>

        <input
          type="text"
          placeholder="Name..."
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          className="w-full md:w-1/4 px-3 py-2 border rounded-lg text-sm"
        />

        <input
          type="text"
          placeholder="Email..."
          value={filters.email}
          onChange={(e) => setFilters({ ...filters, email: e.target.value })}
          className="w-full md:w-1/4 px-3 py-2 border rounded-lg text-sm"
        />

        <input
          type="text"
          placeholder="Phone..."
          value={filters.phone}
          onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
          className="w-full md:w-1/4 px-3 py-2 border rounded-lg text-sm"
        />

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="w-full md:w-1/5 px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        {Object.values(filters).some((v) => v) && (
          <button
            onClick={() =>
              setFilters({
                name: "",
                email: "",
                phone: "",
                status: "",
                search: "",
              })
            }
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
          data={bookings}
          pagination
          highlightOnHover
          progressPending={loading}
          paginationPerPage={8}
        />
      </div>

      {/* Modal */}
      <BookingModal
        modal={modal}
        setModal={setModal}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        loading={loading}
        services={services}
        programs={programs}
      />
    </div>
  );
}

/* --------------------------- ROW ACTIONS --------------------------- */
const RowActions = ({ row, permissionLevel, onView, onEdit, onDelete }) => {
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

/* --------------------------- BOOKING MODAL --------------------------- */
const BookingModal = ({
  modal,
  setModal,
  formData,
  setFormData,
  handleSubmit,
  loading,
  services,
  programs,
}) => (
  <Transition appear show={!!modal.type} as={Fragment}>
    <Dialog
      as="div"
      className="relative z-50"
      onClose={() => setModal({ type: null, data: null })}
    >
      <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100">
        <div className="fixed inset-0 bg-black/50" />
      </Transition.Child>

      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="bg-white w-full max-w-2xl rounded-xl shadow-xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <Dialog.Title className="text-lg font-semibold text-gray-800">
              {modal.type === "view" && "View Booking"}
              {modal.type === "edit" && "Edit Booking"}
              {modal.type === "create" && "Create Booking"}
            </Dialog.Title>
            <button onClick={() => setModal({ type: null, data: null })} className="text-gray-500 hover:text-gray-700">
              <X size={18} />
            </button>
          </div>

          {modal.type === "view" ? (
            <ViewBooking booking={modal.data} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="border rounded-lg px-3 py-2 w-full"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="border rounded-lg px-3 py-2 w-full"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="border rounded-lg px-3 py-2 w-full"
                />

                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  required
                  className="border rounded-lg px-3 py-2 w-full"
                >
                  <option value="">Select Service</option>
                  {services.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>

                <select
                  value={formData.programType}
                  onChange={(e) => setFormData({ ...formData, programType: e.target.value })}
                  required
                  className="border rounded-lg px-3 py-2 w-full"
                >
                  <option value="">Select Program</option>
                  {programs.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>

                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="border rounded-lg px-3 py-2 w-full"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <textarea
                rows="4"
                placeholder="Message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="border rounded-lg px-3 py-2 w-full"
              />

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

/* --------------------------- VIEW BOOKING --------------------------- */
const ViewBooking = ({ booking }) => (
  <div className="space-y-3 text-gray-700">
    <p><strong>Name:</strong> {booking?.name}</p>
    <p><strong>Email:</strong> {booking?.email}</p>
    <p><strong>Phone:</strong> {booking?.phone}</p>
    <p><strong>Service:</strong> {booking?.serviceType?.name}</p>
    <p><strong>Program:</strong> {booking?.programType?.name}</p>
    <p><strong>Status:</strong> {booking?.status}</p>
    <p><strong>Message:</strong> {booking?.message}</p>
    <p><strong>Created:</strong> {new Date(booking?.createdAt).toLocaleString()}</p>
  </div>
);

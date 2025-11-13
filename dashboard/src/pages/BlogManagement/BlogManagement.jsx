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

export default function BlogManagement() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    title: "",
    category: "",
    contentType: "",
    publicationStatus: "",
    authorName: "",
    tags: "",
    status: "",
  });

  const [modal, setModal] = useState({ type: null, data: null });
  const [formData, setFormData] = useState({
    title: "",
    contentType: "article",
    category: "",
    publicationStatus: "draft",
    content: "",
    authorName: "",
    authorPosition: "",
    readTime: "",
    image: "",
    tags: "",
    status: false,
  });

  const { roleAndPermission } = useSelector((state) => state.auth);
  const permissionLevel = roleAndPermission?.["blogManagement"] || 0;

  /* --------------------------- FETCH BLOGS --------------------------- */
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const body = {};
      // Include only active filters
      for (const [key, value] of Object.entries(filters)) {
        if (value) body[key] = value;
      }

      const { data } = await api.post("/api/admin/blog/all", body);
      if (data.success) {
        setBlogs(data.blogs || []);
      } else {
        toast.error(data.message || "Failed to fetch blogs");
      }
    } catch {
      toast.error("Server error while fetching blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    const delay = setTimeout(fetchBlogs, 600);
    return () => clearTimeout(delay);
  }, [filters]);

  /* --------------------------- CRUD --------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const url =
        modal.type === "edit"
          ? `/api/admin/blog/${modal.data._id}`
          : "/api/admin/blog";
      const method = modal.type === "edit" ? api.patch : api.post;

      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
      };

      await method(url, payload);
      toast.success(
        `Blog ${modal.type === "edit" ? "updated" : "created"} successfully`
      );
      setModal({ type: null, data: null });
      fetchBlogs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving blog");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      const { data } = await api.delete(`/api/admin/blog/${id}`);
      if (data.success) {
        toast.success("Blog deleted successfully");
        fetchBlogs();
      }
    } catch {
      toast.error("Failed to delete blog");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const { data } = await api.patch(`/api/admin/blog/${id}/status`);
      if (data.success) {
        toast.success(data.message);
        fetchBlogs();
      }
    } catch {
      toast.error("Failed to update blog status");
    }
  };

  /* --------------------------- TABLE CONFIG --------------------------- */
  const columns = useMemo(
    () => [
      { name: "Title", selector: (row) => row.title, sortable: true },
      { name: "Category", selector: (row) => row.category },
      { name: "Content Type", selector: (row) => row.contentType },
      { name: "Author", selector: (row) => row.authorName },
      { name: "Publication", selector: (row) => row.publicationStatus },
      {
        name: "Approval",
        cell: (row) => (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              row.status
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {row.status ? "Approved" : "Pending"}
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
                title: row.title,
                contentType: row.contentType,
                category: row.category,
                publicationStatus: row.publicationStatus,
                content: row.content,
                authorName: row.authorName,
                authorPosition: row.authorPosition,
                readTime: row.readTime,
                image: row.image,
                tags: row.tags?.join(", "),
                status: row.status,
              });
              setModal({ type: "edit", data: row });
            }}
            onDelete={() => handleDelete(row._id)}
            onToggleStatus={() => handleToggleStatus(row._id)}
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
        <h1 className="text-xl font-semibold">Blog Management</h1>
        {permissionLevel >= 2 && (
          <button
            onClick={() => {
              setFormData({
                title: "",
                contentType: "article",
                category: "",
                publicationStatus: "draft",
                content: "",
                authorName: "",
                authorPosition: "",
                readTime: "",
                image: "",
                tags: "",
                status: false,
              });
              setModal({ type: "create", data: null });
            }}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Plus size={18} /> Create Blog
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="text-sm font-medium text-gray-600">Filters:</div>

        <input
          type="text"
          placeholder="Search by Title..."
          value={filters.title}
          onChange={(e) => setFilters({ ...filters, title: e.target.value })}
          className="w-full md:w-1/4 px-3 py-2 border rounded-lg text-sm"
        />

        <input
          type="text"
          placeholder="Category..."
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="w-full md:w-1/4 px-3 py-2 border rounded-lg text-sm"
        />

        <select
          value={filters.contentType}
          onChange={(e) =>
            setFilters({ ...filters, contentType: e.target.value })
          }
          className="w-full md:w-1/5 px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">All Content Types</option>
          <option value="article">Article</option>
          <option value="news">News</option>
          <option value="story">Story</option>
          <option value="tutorial">Tutorial</option>
        </select>

        <select
          value={filters.publicationStatus}
          onChange={(e) =>
            setFilters({ ...filters, publicationStatus: e.target.value })
          }
          className="w-full md:w-1/5 px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>

        <input
          type="text"
          placeholder="Author Name..."
          value={filters.authorName}
          onChange={(e) => setFilters({ ...filters, authorName: e.target.value })}
          className="w-full md:w-1/4 px-3 py-2 border rounded-lg text-sm"
        />

        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={filters.tags}
          onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
          className="w-full md:w-1/3 px-3 py-2 border rounded-lg text-sm"
        />

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="w-full md:w-1/5 px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">All Blogs</option>
          <option value="true">Approved</option>
          <option value="false">Pending</option>
        </select>

        {(Object.values(filters).some((v) => v)) && (
          <button
            onClick={() =>
              setFilters({
                title: "",
                category: "",
                contentType: "",
                publicationStatus: "",
                authorName: "",
                tags: "",
                status: "",
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
          data={blogs}
          pagination
          highlightOnHover
          progressPending={loading}
          paginationPerPage={8}
        />
      </div>

      {/* Modal */}
      <BlogModal
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
  const canApprove = permissionLevel >= 4;

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
          {canApprove && (
            <MenuItem
              icon={row.status ? <XCircle size={16} /> : <CheckCircle size={16} />}
              label={row.status ? "Disapprove" : "Approve"}
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


/* --------------------------- BLOG MODAL --------------------------- */
const BlogModal = ({
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
        <Dialog.Panel className="bg-white w-full max-w-2xl rounded-xl shadow-xl p-6 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-2">
            <Dialog.Title className="text-lg font-semibold text-gray-800">
              {modal.type === "view" && "View Blog"}
              {modal.type === "edit" && "Edit Blog"}
              {modal.type === "create" && "Create New Blog"}
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
            <ViewBlog blog={modal.data} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title + Category */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Content Type + Publication */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Content Type
                  </label>
                  <select
                    value={formData.contentType}
                    onChange={(e) =>
                      setFormData({ ...formData, contentType: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="article">Article</option>
                    <option value="news">News</option>
                    <option value="story">Story</option>
                    <option value="tutorial">Tutorial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={formData.publicationStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        publicationStatus: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              {/* Author + Position + Read Time */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={formData.authorName}
                    onChange={(e) =>
                      setFormData({ ...formData, authorName: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Author Position
                  </label>
                  <input
                    type="text"
                    value={formData.authorPosition}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        authorPosition: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Read Time
                  </label>
                  <input
                    type="text"
                    value={formData.readTime}
                    onChange={(e) =>
                      setFormData({ ...formData, readTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Image + Tags */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="tech, ai, blog"
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={5}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
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

/* --------------------------- VIEW BLOG --------------------------- */
const ViewBlog = ({ blog }) => (
  <div className="space-y-3 text-gray-700">
    <p><strong>Title:</strong> {blog?.title}</p>
    <p><strong>Category:</strong> {blog?.category}</p>
    <p><strong>Content Type:</strong> {blog?.contentType}</p>
    <p><strong>Publication:</strong> {blog?.publicationStatus}</p>
    <p><strong>Author:</strong> {blog?.authorName}</p>
    <p><strong>Position:</strong> {blog?.authorPosition}</p>
    <p><strong>Read Time:</strong> {blog?.readTime}</p>
    <p><strong>Tags:</strong> {blog?.tags?.join(", ") || "—"}</p>
    <p>
      <strong>Status:</strong>{" "}
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          blog?.status
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {blog?.status ? "Approved" : "Pending"}
      </span>
    </p>
    <p><strong>Content:</strong></p>
    <div className="border p-3 rounded-lg bg-gray-50 text-sm whitespace-pre-line">
      {blog?.content}
    </div>
  </div>
);


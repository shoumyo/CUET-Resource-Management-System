import { useState, useEffect } from "react";
import { getPendingAdminBookings, getAllBookings, adminApprove, adminReject, deleteBooking } from "./api/bookingApi";
import { getAllResources, createResource, updateResource, deleteResource } from "./api/resourceApi";
import { getAllUsers, deleteUser } from "./api/userApi";
import { useToast } from "./components/Toast";
import cuetLogo from "./Photos/cuet-logo.png";

const statusConfig = {
  HELD: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "schedule" },
  PENDING_REFERENCE: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "hourglass_top" },
  PENDING_ADMIN: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: "admin_panel_settings" },
  CONFIRMED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "verified" },
  REJECTED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "cancel" },
  TIMEOUT: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", icon: "timer_off" },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", icon: "help" };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border ${config.bg} ${config.text} ${config.border}`}>
      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>{config.icon}</span>
      {status?.replace(/_/g, " ")}
    </span>
  );
};

const roleBadgeColors = {
  STUDENT: "bg-blue-50 text-blue-700 border-blue-200",
  TEACHER: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
};

// Confirmation Modal
function ConfirmModal({ open, title, message, onConfirm, onCancel, danger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 modal-overlay" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-slide-up">
        <div className={`w-12 h-12 rounded-xl ${danger ? "bg-red-50" : "bg-primary/8"} flex items-center justify-center mb-4`}>
          <span className={`material-symbols-outlined ${danger ? "text-red-500" : "text-primary"}`} style={{ fontSize: "24px" }}>
            {danger ? "warning" : "help"}
          </span>
        </div>
        <h3 className="text-[18px] font-bold text-on-surface mb-1">{title}</h3>
        <p className="text-[14px] text-on-surface-variant mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-outline-variant/50 rounded-xl text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container-low transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:shadow-lg ${danger ? "bg-red-500 hover:bg-red-600 hover:shadow-red-500/25" : "gradient-primary hover:shadow-primary/25"}`}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// Resource Form Modal
function ResourceFormModal({ open, onClose, onSubmit, editResource }) {
  const [form, setForm] = useState({ name: "", type: "", capacity: "", indoor: false, openTime: "", closeTime: "" });

  useEffect(() => {
    if (editResource) {
      setForm({
        name: editResource.name || "",
        type: editResource.type || "",
        capacity: editResource.capacity || "",
        indoor: editResource.indoor || false,
        openTime: editResource.openTime || "",
        closeTime: editResource.closeTime || "",
      });
    } else {
      setForm({ name: "", type: "", capacity: "", indoor: false, openTime: "", closeTime: "" });
    }
  }, [editResource, open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 modal-overlay" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-slide-up">
        <h3 className="text-[18px] font-bold text-on-surface mb-4">{editResource ? "Edit Resource" : "Add New Resource"}</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ ...form, capacity: Number(form.capacity) || null });
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-[12px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-standard w-full px-3 py-2.5 text-[14px] bg-white rounded-xl" placeholder="e.g. East Gallery" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Type</label>
              <input required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-standard w-full px-3 py-2.5 text-[14px] bg-white rounded-xl" placeholder="Gallery" />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Capacity</label>
              <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="input-standard w-full px-3 py-2.5 text-[14px] bg-white rounded-xl" placeholder="100" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="indoor-check" checked={form.indoor} onChange={(e) => setForm({ ...form, indoor: e.target.checked })} className="w-4 h-4 text-primary rounded" />
            <label htmlFor="indoor-check" className="text-[13px] text-on-surface">Indoor venue</label>
          </div>
          {form.indoor && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Open Time</label>
                <input type="time" value={form.openTime} onChange={(e) => setForm({ ...form, openTime: e.target.value })} className="input-standard w-full px-3 py-2.5 text-[14px] bg-white rounded-xl" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Close Time</label>
                <input type="time" value={form.closeTime} onChange={(e) => setForm({ ...form, closeTime: e.target.value })} className="input-standard w-full px-3 py-2.5 text-[14px] bg-white rounded-xl" />
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-outline-variant/50 rounded-xl text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container-low transition-all">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white gradient-primary hover:shadow-lg hover:shadow-primary/25 transition-all">{editResource ? "Update" : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboard({ onLogout, user }) {
  const toast = useToast();
  const [activeNav, setActiveNav] = useState("overview");
  const [pendingAdmin, setPendingAdmin] = useState([]);
  const [allBookingsList, setAllBookingsList] = useState([]);
  const [resourcesList, setResourcesList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [bookingFilter, setBookingFilter] = useState("ALL");

  // Modals
  const [confirmModal, setConfirmModal] = useState({ open: false, title: "", message: "", onConfirm: null, danger: false });
  const [resourceFormOpen, setResourceFormOpen] = useState(false);
  const [editResource, setEditResource] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeNav]);

  const fetchData = async () => {
    try {
      if (activeNav === "overview") {
        const r = await getAllResources();
        setResourcesList(r);
        const p = await getPendingAdminBookings();
        setPendingAdmin(p);
        const a = await getAllBookings();
        setAllBookingsList(a);
        const u = await getAllUsers();
        setUsersList(u);
      } else if (activeNav === "bookings") {
        const a = await getAllBookings();
        setAllBookingsList(a);
      } else if (activeNav === "resources") {
        const r = await getAllResources();
        setResourcesList(r);
      } else if (activeNav === "users") {
        const u = await getAllUsers();
        setUsersList(u);
      } else if (activeNav === "approvals") {
        const p = await getPendingAdminBookings();
        setPendingAdmin(p);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data.");
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminApprove(id);
      toast.success("Booking approved successfully!", "Approved");
      fetchData();
    } catch (err) {
      toast.error("Error approving: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (id) => {
    try {
      await adminReject(id);
      toast.warning("Booking rejected.", "Rejected");
      fetchData();
    } catch (err) {
      toast.error("Error rejecting: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteBooking = (id) => {
    setConfirmModal({
      open: true, danger: true,
      title: "Delete Booking",
      message: `Are you sure you want to permanently delete booking #${id}? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmModal({ open: false });
        try {
          await deleteBooking(id);
          toast.success("Booking deleted successfully.", "Deleted");
          fetchData();
        } catch (err) {
          toast.error("Failed to delete booking: " + (err.response?.data?.message || err.message));
        }
      },
    });
  };

  const handleDeleteUser = (u) => {
    setConfirmModal({
      open: true, danger: true,
      title: "Delete User",
      message: `Delete user "${u.name}" (${u.email})? All their bookings will also be removed.`,
      onConfirm: async () => {
        setConfirmModal({ open: false });
        try {
          await deleteUser(u.id);
          toast.success(`User "${u.name}" deleted.`, "Deleted");
          fetchData();
        } catch (err) {
          toast.error("Failed to delete user: " + (err.response?.data?.message || err.message));
        }
      },
    });
  };

  const handleDeleteResource = (r) => {
    setConfirmModal({
      open: true, danger: true,
      title: "Delete Resource",
      message: `Delete "${r.name}"? All bookings for this resource will also be removed.`,
      onConfirm: async () => {
        setConfirmModal({ open: false });
        try {
          await deleteResource(r.resourceId);
          toast.success(`Resource "${r.name}" deleted.`, "Deleted");
          fetchData();
        } catch (err) {
          toast.error("Failed to delete resource: " + (err.response?.data?.message || err.message));
        }
      },
    });
  };

  const handleResourceFormSubmit = async (formData) => {
    try {
      if (editResource) {
        await updateResource(editResource.resourceId, formData);
        toast.success("Resource updated successfully.", "Updated");
      } else {
        await createResource(formData);
        toast.success("Resource created successfully.", "Created");
      }
      setResourceFormOpen(false);
      setEditResource(null);
      fetchData();
    } catch (err) {
      toast.error("Failed: " + (err.response?.data?.message || err.message));
    }
  };

  const filteredBookings = bookingFilter === "ALL" ? allBookingsList : allBookingsList.filter(b => b.status === bookingFilter);

  const navItems = [
    { id: "overview", icon: "dashboard", label: "Dashboard" },
    { id: "approvals", icon: "pending_actions", label: "Approvals" },
    { id: "bookings", icon: "event_note", label: "All Bookings" },
    { id: "resources", icon: "domain", label: "Resources" },
    { id: "users", icon: "people", label: "Users" },
  ];

  const statCards = [
    { label: "Total Resources", value: resourcesList.length, icon: "domain", color: "bg-blue-50 text-blue-600" },
    { label: "Pending Approvals", value: pendingAdmin.length, icon: "pending_actions", color: "bg-amber-50 text-amber-600" },
    { label: "Total Bookings", value: allBookingsList.length, icon: "event_note", color: "bg-purple-50 text-purple-600" },
    { label: "Total Users", value: usersList.length, icon: "people", color: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div className="text-on-surface font-body-md min-h-screen overflow-x-hidden flex" style={{ background: "linear-gradient(135deg, #f8f9fc 0%, #eef0f7 50%, #f0f2fa 100%)" }}>
      {/* Side NavBar */}
      <nav className="hidden md:flex flex-col bg-white/80 backdrop-blur-xl border-r border-outline-variant/40 w-[260px] h-screen fixed left-0 top-0 z-40 p-md">
        <div className="flex items-center gap-sm mb-xl">
          <div className="w-11 h-11 gradient-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 overflow-hidden p-1">
            <img src={cuetLogo} alt="CUET Logo" className="w-full h-full object-contain bg-white rounded-lg" />
          </div>
          <div>
            <h1 className="text-headline-md font-headline-md text-primary font-bold tracking-tight">CUET Admin</h1>
            <p className="text-label-sm font-label-sm text-on-surface-variant">Control Center</p>
          </div>
        </div>
        <ul className="flex flex-col gap-xs flex-grow">
          {navItems.map(({ id, icon, label }) => (
            <li key={id}>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setActiveNav(id); }}
                className={`flex items-center gap-md px-md py-[10px] rounded-xl transition-all duration-200 ${activeNav === id ? "bg-primary/8 text-primary font-semibold shadow-sm" : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"}`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px", fontVariationSettings: activeNav === id ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
                <span className="text-[13px]">{label}</span>
                {id === "approvals" && pendingAdmin.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{pendingAdmin.length}</span>
                )}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-md border-t border-outline-variant/40">
          <div className="flex items-center gap-sm mb-sm">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-on-surface">{user?.name}</span>
              <span className="text-[11px] text-on-surface-variant">System Administrator</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full text-left flex items-center gap-md px-md py-[10px] text-error hover:bg-red-50 rounded-xl transition-all duration-200 text-[13px] font-medium"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>logout</span>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-[260px] min-h-screen">
        <header className="bg-white/70 backdrop-blur-xl border-b border-outline-variant/30 px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h2 className="text-[22px] font-bold text-on-surface tracking-tight">
              {navItems.find((n) => n.id === activeNav)?.label || "Dashboard"}
            </h2>
            <p className="text-[12px] text-on-surface-variant mt-0.5">Manage the entire CUET booking system</p>
          </div>
          <div className="flex items-center gap-sm">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 p-margin-mobile md:p-margin-desktop">
          {/* ═══════════════════════════ OVERVIEW ═══════════════════════════ */}
          {activeNav === "overview" && (
            <div className="animate-fade-in space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((s, i) => (
                  <div key={s.label} className="card-level-1 p-5 animate-slide-up" style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}>
                    <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                      <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>{s.icon}</span>
                    </div>
                    <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">{s.label}</p>
                    <p className="text-[28px] font-bold text-on-surface mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Recent Pending */}
              {pendingAdmin.length > 0 && (
                <div className="card-level-1 overflow-hidden">
                  <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between">
                    <h3 className="text-[16px] font-bold text-on-surface">Pending Approvals</h3>
                    <button onClick={() => setActiveNav("approvals")} className="text-[12px] font-semibold text-primary hover:underline">View All →</button>
                  </div>
                  <div className="divide-y divide-outline-variant/30">
                    {pendingAdmin.slice(0, 3).map((b) => (
                      <div key={b.bookingId} className="p-5 flex flex-col md:flex-row md:items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[12px] font-medium text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-md">#{b.bookingId}</span>
                            <StatusBadge status={b.status} />
                          </div>
                          <p className="text-[15px] font-semibold text-on-surface">{b.resourceName}</p>
                          <p className="text-[12px] text-on-surface-variant">By {b.studentName} · {new Date(b.startTime).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(b.bookingId)} className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[12px] font-semibold hover:bg-emerald-100 transition-all">Approve</button>
                          <button onClick={() => handleReject(b.bookingId)} className="px-4 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 text-[12px] font-semibold hover:bg-red-100 transition-all">Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════ APPROVALS ═══════════════════════════ */}
          {activeNav === "approvals" && (
            <div className="animate-fade-in">
              <div className="card-level-1 overflow-hidden">
                <div className="p-5 border-b border-outline-variant/30">
                  <h3 className="text-[16px] font-bold text-on-surface">Pending Admin Approval</h3>
                  <p className="text-[12px] text-on-surface-variant mt-0.5">{pendingAdmin.length} booking(s) waiting</p>
                </div>
                <div className="divide-y divide-outline-variant/30">
                  {pendingAdmin.map((b, i) => (
                    <div key={b.bookingId} className="p-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-primary/[0.02] transition-colors animate-slide-up" style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[12px] font-medium text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-md">#{b.bookingId}</span>
                          <StatusBadge status={b.status} />
                        </div>
                        <p className="text-[16px] font-semibold text-on-surface">{b.resourceName}</p>
                        <p className="text-[13px] text-on-surface-variant">
                          Student: {b.studentName} ({b.studentEmail}) · Ref: {b.referenceTeacherName || "N/A"}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-[12px] text-on-surface-variant">
                          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>schedule</span>
                          {new Date(b.startTime).toLocaleString()} — {new Date(b.endTime).toLocaleTimeString()}
                        </div>
                        {b.purpose && <p className="text-[12px] text-on-surface-variant mt-1 italic">Purpose: {b.purpose}</p>}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => handleApprove(b.bookingId)} className="px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[12px] font-semibold hover:bg-emerald-100 transition-all">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: "16px" }}>check</span> Approve</span>
                        </button>
                        <button onClick={() => handleReject(b.bookingId)} className="px-5 py-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-[12px] font-semibold hover:bg-red-100 transition-all">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: "16px" }}>close</span> Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {pendingAdmin.length === 0 && (
                    <div className="p-16 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined block mb-3" style={{ fontSize: "48px", opacity: 0.4 }}>task_alt</span>
                      <p className="text-[16px] font-medium">All caught up!</p>
                      <p className="text-[13px] mt-1">No pending admin approvals.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════ ALL BOOKINGS ═══════════════════════════ */}
          {activeNav === "bookings" && (
            <div className="animate-fade-in space-y-4">
              {/* Filter chips */}
              <div className="flex gap-2 flex-wrap">
                {["ALL", "HELD", "PENDING_REFERENCE", "PENDING_ADMIN", "CONFIRMED", "REJECTED", "TIMEOUT"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setBookingFilter(s)}
                    className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                      bookingFilter === s
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-white/80 text-on-surface-variant border-outline-variant/50 hover:bg-white"
                    }`}
                  >
                    {s === "ALL" ? "All" : s.replace(/_/g, " ")}
                  </button>
                ))}
              </div>

              <div className="card-level-1 overflow-hidden">
                <div className="divide-y divide-outline-variant/30">
                  {filteredBookings.map((b, i) => (
                    <div key={b.bookingId} className="p-5 flex flex-col md:flex-row md:items-center gap-3 hover:bg-primary/[0.02] transition-colors animate-slide-up" style={{ animationDelay: `${i * 0.03}s`, animationFillMode: "both" }}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[12px] font-medium text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-md">#{b.bookingId}</span>
                          <StatusBadge status={b.status} />
                        </div>
                        <p className="text-[15px] font-semibold text-on-surface">{b.resourceName}</p>
                        <p className="text-[12px] text-on-surface-variant">Student: {b.studentName} ({b.studentEmail})</p>
                        <div className="flex items-center gap-1 mt-0.5 text-[12px] text-on-surface-variant">
                          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>schedule</span>
                          {new Date(b.startTime).toLocaleString()} — {new Date(b.endTime).toLocaleTimeString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteBooking(b.bookingId)}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-[12px] font-semibold hover:bg-red-100 transition-all flex-shrink-0"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
                        Delete
                      </button>
                    </div>
                  ))}
                  {filteredBookings.length === 0 && (
                    <div className="p-16 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined block mb-3" style={{ fontSize: "48px", opacity: 0.4 }}>event_busy</span>
                      <p className="text-[16px] font-medium">No bookings found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════ RESOURCES ═══════════════════════════ */}
          {activeNav === "resources" && (
            <div className="animate-fade-in space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-[14px] text-on-surface-variant">{resourcesList.length} resources in the system</p>
                <button
                  onClick={() => { setEditResource(null); setResourceFormOpen(true); }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl gradient-primary text-white text-[12px] font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add</span>
                  Add Resource
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resourcesList.map((r, i) => (
                  <div key={r.resourceId} className="card-level-1 p-5 animate-slide-up" style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary" style={{ fontSize: "22px" }}>domain</span>
                        </div>
                        <div>
                          <h3 className="text-[15px] font-bold text-on-surface">{r.name}</h3>
                          <p className="text-[12px] text-on-surface-variant">{r.type}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${r.currentlyAvailable ? "badge-available" : "badge-unavailable"}`}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.currentlyAvailable ? "#10b981" : "#ef4444" }} />
                        {r.currentlyAvailable ? "AVAILABLE" : "IN USE"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[12px] text-on-surface-variant mb-4">
                      <span>Capacity: {r.capacity || "—"}</span>
                      <span>{r.indoor ? "Indoor" : "Outdoor"}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditResource(r); setResourceFormOpen(true); }}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-[12px] font-semibold hover:bg-blue-100 transition-all"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</span> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteResource(r)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-[12px] font-semibold hover:bg-red-100 transition-all"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════ USERS ═══════════════════════════ */}
          {activeNav === "users" && (
            <div className="animate-fade-in">
              <p className="text-[14px] text-on-surface-variant mb-4">{usersList.length} registered users</p>
              <div className="card-level-1 overflow-hidden">
                <div className="divide-y divide-outline-variant/30">
                  {usersList.map((u, i) => (
                    <div key={u.id} className="p-5 flex items-center gap-4 hover:bg-primary/[0.02] transition-colors animate-slide-up" style={{ animationDelay: `${i * 0.03}s`, animationFillMode: "both" }}>
                      <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                        {u.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold text-on-surface truncate">{u.name}</p>
                        <p className="text-[12px] text-on-surface-variant truncate">{u.email}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${roleBadgeColors[u.role] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {u.role}
                      </span>
                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-[12px] font-semibold hover:bg-red-100 transition-all flex-shrink-0"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span>
                        Delete
                      </button>
                    </div>
                  ))}
                  {usersList.length === 0 && (
                    <div className="p-16 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined block mb-3" style={{ fontSize: "48px", opacity: 0.4 }}>person_off</span>
                      <p className="text-[16px] font-medium">No users found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <ConfirmModal {...confirmModal} onCancel={() => setConfirmModal({ open: false })} />
      <ResourceFormModal open={resourceFormOpen} onClose={() => { setResourceFormOpen(false); setEditResource(null); }} onSubmit={handleResourceFormSubmit} editResource={editResource} />
    </div>
  );
}

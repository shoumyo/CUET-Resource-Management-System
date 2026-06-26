import { useState, useEffect } from "react";
import { getPendingAdminBookings, getAllBookings, adminApprove, adminReject, deleteBooking } from "./api/bookingApi";
import { getAllResources, createResource, updateResource, deleteResource } from "./api/resourceApi";
import { getAllUsers, deleteUser } from "./api/userApi";
import { useToast } from "./components/Toast";
import cuetLogo from "./Photos/cuet-logo.png";
import ProfileModal from "./components/ProfileModal";
import TextModal from "./components/TextModal";

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
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide border ${config.bg} ${config.text} ${config.border}`}>
      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>{config.icon}</span>
      {status?.replace(/_/g, " ")}
    </span>
  );
};

const typeIcons = {
  "Gallery": "museum",
  "Auditorium": "theater_comedy",
  "Hall": "meeting_room",
  "Outdoor Field": "sports_soccer",
  "Lab": "science",
  "Seminar Room": "groups",
  "Conference Room": "video_call",
};

const typeGradients = {
  "Gallery": "from-violet-500 to-purple-600",
  "Auditorium": "from-rose-500 to-pink-600",
  "Hall": "from-blue-500 to-indigo-600",
  "Outdoor Field": "from-emerald-500 to-teal-600",
  "Lab": "from-cyan-500 to-blue-600",
  "Seminar Room": "from-amber-500 to-orange-600",
  "Conference Room": "from-slate-500 to-gray-700",
};

const roleBadgeColors = {
  STUDENT: "bg-blue-100 text-blue-700 border-blue-200",
  TEACHER: "bg-emerald-100 text-emerald-700 border-emerald-200",
  ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
};

// Format date nicely
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function getDuration(start, end) {
  if (!start || !end) return "—";
  const ms = new Date(end) - new Date(start);
  const hrs = Math.round(ms / 3600000);
  return hrs === 1 ? "1 hour" : `${hrs} hours`;
}

// Confirmation Modal
function ConfirmModal({ open, title, message, onConfirm, onCancel, danger, showInput, inputValue, onInputChange, inputPlaceholder }) {
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
        <p className="text-[14px] text-on-surface-variant mb-5 leading-relaxed">{message}</p>
        
        {/* showInput removed */}

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
        <h3 className="text-[20px] font-bold text-on-surface mb-5">{editResource ? "Edit Resource" : "Add New Resource"}</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ ...form, capacity: Number(form.capacity) || null });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Resource Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-standard w-full px-3 py-2.5 text-[14px] bg-white rounded-xl focus:ring-2 focus:ring-primary/30" placeholder="e.g. East Gallery" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Type</label>
              <input required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-standard w-full px-3 py-2.5 text-[14px] bg-white rounded-xl focus:ring-2 focus:ring-primary/30" placeholder="e.g. Gallery" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Capacity</label>
              <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="input-standard w-full px-3 py-2.5 text-[14px] bg-white rounded-xl focus:ring-2 focus:ring-primary/30" placeholder="100" />
            </div>
          </div>
          <div className="p-3.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center">
                <input type="checkbox" id="indoor-check" checked={form.indoor} onChange={(e) => setForm({ ...form, indoor: e.target.checked })} className="w-5 h-5 text-primary rounded focus:ring-primary cursor-pointer border-outline-variant" />
              </div>
              <div>
                <label htmlFor="indoor-check" className="text-[14px] font-semibold text-on-surface cursor-pointer select-none">Indoor Venue</label>
                <p className="text-[11px] text-on-surface-variant leading-tight">Requires specific operational hours</p>
              </div>
            </div>
          </div>
          {form.indoor && (
            <div className="grid grid-cols-2 gap-4 animate-slide-up">
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Open Time</label>
                <input type="time" value={form.openTime} onChange={(e) => setForm({ ...form, openTime: e.target.value })} className="input-standard w-full px-3 py-2.5 text-[14px] bg-white rounded-xl focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Close Time</label>
                <input type="time" value={form.closeTime} onChange={(e) => setForm({ ...form, closeTime: e.target.value })} className="input-standard w-full px-3 py-2.5 text-[14px] bg-white rounded-xl focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-outline-variant/50 rounded-xl text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container-low transition-all">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white gradient-primary hover:shadow-lg hover:shadow-primary/25 transition-all">{editResource ? "Update Resource" : "Create Resource"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboard({ onLogout, user, onUpdateUser }) {
  const toast = useToast();
  const [activeNav, setActiveNav] = useState("overview");
  const [pendingAdmin, setPendingAdmin] = useState([]);
  const [allBookingsList, setAllBookingsList] = useState([]);
  const [resourcesList, setResourcesList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [bookingFilter, setBookingFilter] = useState("ALL");
  const [expandedCard, setExpandedCard] = useState(null);

  // Modals
  const [confirmModal, setConfirmModal] = useState({ open: false, title: "", message: "", onConfirm: null, danger: false });
  const [resourceFormOpen, setResourceFormOpen] = useState(false);
  const [adminRemarksMap, setAdminRemarksMap] = useState({});
  const [expandedText, setExpandedText] = useState(null);
  const [editResource, setEditResource] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeNav]);

  const fetchData = async () => {
    try {
      const now = new Date();
      const sortData = (data) => data.sort((a, b) => {
        const timeA = new Date(a.startTime);
        const timeB = new Date(b.startTime);
        const isPastA = timeA < now;
        const isPastB = timeB < now;
        if (isPastA && !isPastB) return 1;
        if (!isPastA && isPastB) return -1;
        if (!isPastA && !isPastB) return timeA - timeB;
        return timeB - timeA;
      });

      if (activeNav === "overview") {
        const r = await getAllResources();
        setResourcesList(r);
        const p = await getPendingAdminBookings();
        setPendingAdmin(sortData(p));
        const a = await getAllBookings();
        setAllBookingsList(a);
        const u = await getAllUsers();
        setUsersList(u);
      } else if (activeNav === "bookings") {
        const a = await getAllBookings();
        setAllBookingsList(sortData(a));
      } else if (activeNav === "resources") {
        const r = await getAllResources();
        setResourcesList(r);
      } else if (activeNav === "approvals") {
        const p = await getPendingAdminBookings();
        setPendingAdmin(sortData(p));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data.");
    }
  };

  const handleApprove = (req) => {
    setConfirmModal({
      open: true, danger: false,
      title: "Final Confirm Booking?",
      message: `You are about to finally approve ${req.studentName}'s request for "${req.resourceName}".`,
      onConfirm: async () => {
        setConfirmModal({ open: false, title: "", message: "", onConfirm: null, danger: false });
        try {
          await adminApprove(req.bookingId, adminRemarksMap[req.bookingId]);
          toast.success("Booking approved successfully!", "Approved ✓");
          setAdminRemarksMap(prev => ({ ...prev, [req.bookingId]: "" }));
          fetchData();
        } catch (err) {
          toast.error("Error approving: " + (err.response?.data?.message || err.message));
        }
      }
    });
  };

  const handleReject = (req) => {
    setConfirmModal({
      open: true, danger: true,
      title: "Reject Booking?",
      message: `You are about to reject ${req.studentName}'s request for "${req.resourceName}".`,
      onConfirm: async () => {
        setConfirmModal({ open: false, title: "", message: "", onConfirm: null, danger: false });
        try {
          await adminReject(req.bookingId, adminRemarksMap[req.bookingId]);
          toast.warning("Booking rejected.", "Rejected");
          setAdminRemarksMap(prev => ({ ...prev, [req.bookingId]: "" }));
          fetchData();
        } catch (err) {
          toast.error("Error rejecting: " + (err.response?.data?.message || err.message));
        }
      }
    });
  };

  const handleDeleteBooking = (id) => {
    setConfirmModal({
      open: true, danger: true,
      title: "Delete Booking?",
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
      title: "Delete User?",
      message: `Delete user "${u.name}" (${u.email})? All their bookings will also be permanently removed.`,
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
      title: "Delete Resource?",
      message: `Delete "${r.name}"? All bookings for this resource will also be permanently removed.`,
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

  const toggleExpand = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const filteredBookings = bookingFilter === "ALL" ? allBookingsList : allBookingsList.filter(b => b.status === bookingFilter);

  const navItems = [
    { id: "overview", icon: "dashboard", label: "Dashboard" },
    { id: "approvals", icon: "pending_actions", label: "Pending Approvals" },
    { id: "bookings", icon: "event_note", label: "All Bookings" },
    { id: "resources", icon: "domain", label: "Resources Hub" },
    { id: "users", icon: "people", label: "User Management" },
  ];

  const statCards = [
    { label: "Total Resources", value: resourcesList.length, icon: "domain", color: "from-blue-500 to-indigo-600" },
    { label: "Pending Approvals", value: pendingAdmin.length, icon: "pending_actions", color: "from-amber-500 to-orange-500" },
    { label: "Total Bookings", value: allBookingsList.length, icon: "event_note", color: "from-purple-500 to-violet-600" },
    { label: "Registered Users", value: usersList.length, icon: "people", color: "from-emerald-500 to-teal-500" },
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
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center justify-center animate-pulse">{pendingAdmin.length}</span>
                )}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-md border-t border-outline-variant/40">
          <button onClick={() => setProfileOpen(true)} className="w-full flex items-center gap-sm mb-sm p-2 rounded-xl hover:bg-surface-container-low transition-colors text-left">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[13px] font-semibold text-on-surface truncate">{user?.name}</span>
              <span className="text-[11px] text-on-surface-variant truncate">System Administrator</span>
            </div>
          </button>
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
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={fetchData} className="flex items-center gap-2 px-3 h-10 rounded-xl hover:bg-surface-container-low transition-colors border border-outline-variant/30 bg-white shadow-sm" title="Refresh">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">refresh</span>
              <span className="text-[13px] font-semibold text-on-surface-variant hidden sm:block">Refresh</span>
            </button>
            <button onClick={() => setProfileOpen(true)} className="flex items-center gap-sm p-1.5 pr-3 rounded-xl hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant/30 text-left bg-white shadow-sm">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                {user?.name?.charAt(0)}
              </div>
              <div className="hidden sm:flex flex-col justify-center overflow-hidden">
                <span className="text-[14px] font-semibold text-on-surface truncate leading-tight">{user?.name}</span>
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 p-margin-mobile md:p-margin-desktop">
          {/* ═══════════════════════════ OVERVIEW ═══════════════════════════ */}
          {activeNav === "overview" && (
            <div className="animate-fade-in space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((s, i) => (
                  <div key={s.label} className="card-level-1 p-5 relative overflow-hidden group animate-slide-up" style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}>
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${s.color} rounded-bl-full opacity-[0.08] group-hover:scale-110 transition-transform duration-500`} />
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-md`}>
                        <span className="material-symbols-outlined text-white" style={{ fontSize: "20px" }}>{s.icon}</span>
                      </div>
                    </div>
                    <p className="text-[32px] font-bold text-on-surface leading-tight mt-2">{s.value}</p>
                    <p className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent Pending */}
              {pendingAdmin.length > 0 ? (
                <div className="card-level-1 overflow-hidden">
                  <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low/30">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500" style={{ fontSize: "20px" }}>notification_important</span>
                      <h3 className="text-[16px] font-bold text-on-surface">Urgent Approvals</h3>
                    </div>
                    <button onClick={() => setActiveNav("approvals")} className="text-[12px] font-semibold text-primary hover:underline flex items-center gap-1">
                      View All <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>arrow_forward</span>
                    </button>
                  </div>
                  <div className="divide-y divide-outline-variant/30">
                    {pendingAdmin.slice(0, 3).map((b) => (
                      <div key={b.bookingId} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-primary/[0.02] transition-colors">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[12px] font-bold text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-md">#{b.bookingId}</span>
                            <StatusBadge status={b.status} />
                          </div>
                          <p className="text-[16px] font-bold text-on-surface">{b.resourceName}</p>
                          <p className="text-[13px] text-on-surface-variant mt-0.5">By {b.studentName} · {formatDate(b.startTime)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(b)} className="px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[12px] font-bold hover:bg-emerald-100 hover:shadow-sm transition-all flex items-center gap-1.5">
                            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>check_circle</span> Approve
                          </button>
                          <button onClick={() => handleReject(b)} className="px-5 py-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-[12px] font-bold hover:bg-red-100 hover:shadow-sm transition-all flex items-center gap-1.5">
                            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>cancel</span> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card-level-1 overflow-hidden p-10 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: "32px" }}>verified</span>
                  </div>
                  <h3 className="text-[18px] font-bold text-on-surface mb-1">System is Up to Date</h3>
                  <p className="text-[14px] text-on-surface-variant max-w-sm">There are no pending approvals requiring your attention at the moment.</p>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════ APPROVALS ═══════════════════════════ */}
          {activeNav === "approvals" && (
            <div className="animate-fade-in space-y-4">
              {pendingAdmin.length === 0 ? (
                <div className="card-level-1 p-20 text-center text-on-surface-variant">
                  <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                    <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: "40px" }}>task_alt</span>
                  </div>
                  <p className="text-[20px] font-bold text-on-surface mb-1">All Caught Up!</p>
                  <p className="text-[14px] text-on-surface-variant max-w-sm mx-auto">There are no bookings waiting for admin approval right now.</p>
                </div>
              ) : (
                pendingAdmin.map((b, i) => {
                  const resourceIcon = typeIcons[b.resourceType] || "domain";
                  const gradient = typeGradients[b.resourceType] || "from-primary to-primary";
                  const isExpanded = expandedCard === b.bookingId;
                  
                  return (
                    <div
                      key={b.bookingId}
                      className="card-level-1 overflow-hidden animate-slide-up transition-all duration-300"
                      style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}
                    >
                      {/* Card Header Gradient */}
                      <div className={`bg-gradient-to-r ${gradient} px-5 py-3 flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <span className="material-symbols-outlined text-white" style={{ fontSize: "20px" }}>{resourceIcon}</span>
                          </div>
                          <div>
                            <h3 className="text-[15px] font-bold text-white leading-tight">{b.resourceName}</h3>
                            <p className="text-[11px] text-white/80 font-medium">{b.resourceType || "Resource"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-white/70 font-bold bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm">
                            #{b.bookingId}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5">
                        {/* ── Expandable Details Button ── */}
                        <button
                          onClick={() => toggleExpand(b.bookingId)}
                          className="w-full flex items-center justify-center gap-1.5 text-[12px] font-semibold text-primary/70 hover:text-primary py-1.5 rounded-lg hover:bg-primary/5 transition-all mb-3"
                        >
                          <span className="material-symbols-outlined transition-transform duration-300" style={{ fontSize: "16px", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}>
                            expand_more
                          </span>
                          {isExpanded ? "Less Details" : "More Details"}
                        </button>

                        <div
                          className="overflow-hidden transition-all duration-300 ease-in-out"
                          style={{
                            maxHeight: isExpanded ? "1200px" : "0px",
                            opacity: isExpanded ? 1 : 0,
                          }}
                        >
                          <div className="pt-3 border-t border-outline-variant/30 mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              {/* Student Info */}
                              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/50 border border-blue-100/70">
                                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="material-symbols-outlined text-blue-600" style={{ fontSize: "18px" }}>school</span>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-0.5">Requested By</p>
                                  <p className="text-[14px] font-semibold text-on-surface leading-snug truncate">{b.studentName}</p>
                                  <p className="text-[11px] text-on-surface-variant truncate mt-0.5">{b.studentEmail}</p>
                                </div>
                              </div>

                              {/* Schedule Info */}
                              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100/70">
                                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: "18px" }}>event</span>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5">Schedule</p>
                                  <p className="text-[14px] font-semibold text-on-surface leading-snug">{formatDate(b.startTime)}</p>
                                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                                    {formatTime(b.startTime)} — {formatTime(b.endTime)} · {getDuration(b.startTime, b.endTime)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Reference & Purpose Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              {b.referenceTeacherName && (
                                <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100/70 flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 text-xs font-bold">
                                    {b.referenceTeacherName.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-0.5">Approved By Teacher</p>
                                    <p className="text-[13px] font-semibold text-on-surface">{b.referenceTeacherName}</p>
                                    {b.teacherRemarks && (
                                      <div 
                                        className="mt-2 p-2 bg-purple-100/50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors group"
                                        onClick={() => setExpandedText({ title: "Teacher's Note", content: b.teacherRemarks, color: "purple" })}
                                      >
                                        <p className="text-[11px] font-bold text-purple-600 mb-0.5 flex justify-between items-center">
                                          Teacher's Note:
                                          <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">open_in_full</span>
                                        </p>
                                        <p className="text-[12px] text-purple-800 italic leading-snug break-words whitespace-pre-wrap line-clamp-2">"{b.teacherRemarks}"</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              {b.purpose && (
                                <div 
                                  className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex-1 cursor-pointer hover:bg-surface-container transition-colors group"
                                  onClick={() => setExpandedText({ title: "Purpose", content: b.purpose, color: "blue" })}
                                >
                                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 flex justify-between items-center">
                                    Purpose
                                    <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">open_in_full</span>
                                  </p>
                                  <p className="text-[13px] text-on-surface break-words whitespace-pre-wrap line-clamp-2">{b.purpose}</p>
                                </div>
                              )}
                            </div>

                            {/* Admin Note Section */}
                            <div className="mb-4">
                              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Add Admin Note (Optional)</label>
                              <textarea
                                className="w-full p-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-[14px] focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                                rows="2"
                                placeholder="Add a message regarding this booking..."
                                value={adminRemarksMap[b.bookingId] || ""}
                                onChange={(e) => setAdminRemarksMap(prev => ({ ...prev, [b.bookingId]: e.target.value }))}
                              ></textarea>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="p-2.5 rounded-lg bg-surface-container-low/50">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Booking ID</p>
                                <p className="text-[13px] font-semibold text-on-surface">#{b.bookingId}</p>
                              </div>
                              <div className="p-2.5 rounded-lg bg-surface-container-low/50">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Resource ID</p>
                                <p className="text-[13px] font-semibold text-on-surface">#{b.resourceId}</p>
                              </div>
                              <div className="p-2.5 rounded-lg bg-surface-container-low/50">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Resource Type</p>
                                <p className="text-[13px] font-semibold text-on-surface">{b.resourceType}</p>
                              </div>
                              <div className="p-2.5 rounded-lg bg-surface-container-low/50">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Submitted At</p>
                                <p className="text-[13px] font-semibold text-on-surface">{new Date(b.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(b)}
                            className="flex-1 py-3 rounded-xl bg-emerald-500 text-white text-[13px] font-semibold hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
                          >
                            <span className="flex items-center justify-center gap-2">
                              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>verified</span>
                              Final Confirm
                            </span>
                          </button>
                          <button
                            onClick={() => handleReject(b)}
                            className="flex-1 py-3 rounded-xl bg-white text-red-600 border-2 border-red-200 text-[13px] font-semibold hover:bg-red-50 hover:border-red-300 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
                          >
                            <span className="flex items-center justify-center gap-2">
                              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>cancel</span>
                              Reject
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ═══════════════════════════ ALL BOOKINGS ═══════════════════════════ */}
          {activeNav === "bookings" && (
            <div className="animate-fade-in space-y-4">
              {/* Filter chips */}
              <div className="flex gap-2 flex-wrap bg-white/60 p-2 rounded-2xl backdrop-blur-md border border-outline-variant/30">
                {["ALL", "HELD", "PENDING_REFERENCE", "PENDING_ADMIN", "CONFIRMED", "REJECTED", "TIMEOUT"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setBookingFilter(s)}
                    className={`px-4 py-2 rounded-xl text-[12px] font-bold border transition-all duration-200 ${
                      bookingFilter === s
                        ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                        : "bg-transparent text-on-surface-variant border-transparent hover:bg-surface-container-low"
                    }`}
                  >
                    {s === "ALL" ? "All Bookings" : s.replace(/_/g, " ")}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredBookings.map((b, i) => (
                  <div key={b.bookingId} className="card-level-1 p-5 flex flex-col justify-between animate-slide-up hover:shadow-xl hover:-translate-y-0.5 transition-all" style={{ animationDelay: `${i * 0.03}s`, animationFillMode: "both" }}>
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-md border border-outline-variant/30">#{b.bookingId}</span>
                          <StatusBadge status={b.status} />
                        </div>
                        <button
                          onClick={() => handleDeleteBooking(b.bookingId)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Booking"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>delete</span>
                        </button>
                      </div>
                      
                      <h3 className="text-[16px] font-bold text-on-surface mb-2">{b.resourceName}</h3>
                      
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center gap-2 text-[12px] text-on-surface-variant">
                          <span className="material-symbols-outlined text-primary/70" style={{ fontSize: "16px" }}>person</span>
                          <span className="font-medium text-on-surface">{b.studentName}</span> ({b.studentEmail})
                        </div>
                        <div className="flex items-center gap-2 text-[12px] text-on-surface-variant">
                          <span className="material-symbols-outlined text-emerald-600/70" style={{ fontSize: "16px" }}>schedule</span>
                          <span>{formatDate(b.startTime)}, {formatTime(b.startTime)} — {formatTime(b.endTime)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredBookings.length === 0 && (
                <div className="card-level-1 p-16 text-center text-on-surface-variant">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: "40px" }}>event_busy</span>
                  </div>
                  <p className="text-[20px] font-bold text-on-surface mb-1">No bookings found</p>
                  <p className="text-[14px]">Try changing the filter to see other bookings.</p>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════ RESOURCES ═══════════════════════════ */}
          {activeNav === "resources" && (
            <div className="animate-fade-in space-y-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white/60 p-4 rounded-2xl backdrop-blur-md border border-outline-variant/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white shadow-sm">
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>domain</span>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-on-surface">Resource Management</h3>
                    <p className="text-[12px] text-on-surface-variant">{resourcesList.length} resources available</p>
                  </div>
                </div>
                <button
                  onClick={() => { setEditResource(null); setResourceFormOpen(true); }}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-bold hover:shadow-lg hover:shadow-primary/25 hover:bg-primary/90 transition-all"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>add_box</span>
                  Add New Resource
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {resourcesList.map((r, i) => {
                  const gradient = typeGradients[r.type] || "from-primary to-primary";
                  const icon = typeIcons[r.type] || "domain";

                  return (
                    <div key={r.resourceId} className="card-level-1 overflow-hidden flex flex-col group animate-slide-up" style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}>
                      <div className={`bg-gradient-to-r ${gradient} p-4 flex items-start justify-between relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-white" style={{ fontSize: "100px" }}>{icon}</span>
                        </div>
                        <div className="relative z-10">
                          <span className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white text-[10px] font-bold tracking-wider mb-2">
                            {r.type}
                          </span>
                          <h3 className="text-[18px] font-bold text-white leading-tight">{r.name}</h3>
                        </div>
                      </div>
                      
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div className="space-y-3 mb-5">
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="text-on-surface-variant flex items-center gap-1.5"><span className="material-symbols-outlined" style={{ fontSize: "16px" }}>group</span> Capacity</span>
                            <span className="font-bold text-on-surface">{r.capacity || "N/A"}</span>
                          </div>
                          <div className="flex items-center justify-between text-[13px]">
                            <span className="text-on-surface-variant flex items-center gap-1.5"><span className="material-symbols-outlined" style={{ fontSize: "16px" }}>roofing</span> Venue Type</span>
                            <span className="font-bold text-on-surface">{r.indoor ? "Indoor" : "Outdoor"}</span>
                          </div>
                          {r.indoor && (
                            <div className="flex items-center justify-between text-[13px]">
                              <span className="text-on-surface-variant flex items-center gap-1.5"><span className="material-symbols-outlined" style={{ fontSize: "16px" }}>schedule</span> Hours</span>
                              <span className="font-bold text-on-surface">{r.openTime?.substring(0,5)} — {r.closeTime?.substring(0,5)}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-[13px] pt-2 border-t border-outline-variant/30">
                            <span className="text-on-surface-variant">Status</span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider ${r.currentlyAvailable ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.currentlyAvailable ? "#10b981" : "#ef4444" }} />
                              {r.currentlyAvailable ? "AVAILABLE" : "IN USE"}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditResource(r); setResourceFormOpen(true); }}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-[12px] hover:bg-blue-100 transition-colors"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</span> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteResource(r)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-red-50 text-red-600 font-bold text-[12px] hover:bg-red-100 transition-colors"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>delete</span> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════════════════════ USERS ═══════════════════════════ */}
          {activeNav === "users" && (
            <div className="animate-fade-in space-y-4">
              <div className="bg-white/60 p-4 rounded-2xl backdrop-blur-md border border-outline-variant/30 flex justify-between items-center">
                <h3 className="text-[16px] font-bold text-on-surface">User Management</h3>
                <span className="text-[12px] font-bold text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-lg">{usersList.length} Total</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {usersList.map((u, i) => (
                  <div key={u.id} className="card-level-1 p-5 flex flex-col items-center text-center animate-slide-up hover:-translate-y-1 transition-transform" style={{ animationDelay: `${i * 0.03}s`, animationFillMode: "both" }}>
                    <div className="relative mb-3">
                      <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-white text-[24px] font-bold shadow-lg shadow-primary/20">
                        {u.name?.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest border bg-white shadow-sm ${
                          u.role === "ADMIN" ? "text-purple-600 border-purple-200" :
                          u.role === "TEACHER" ? "text-emerald-600 border-emerald-200" :
                          "text-blue-600 border-blue-200"
                        }`}>
                          {u.role}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-[15px] font-bold text-on-surface leading-tight mb-0.5">{u.name}</h3>
                    <p className="text-[12px] text-on-surface-variant truncate w-full mb-4">{u.email}</p>
                    
                    <button
                      onClick={() => handleDeleteUser(u)}
                      className="w-full mt-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 text-[12px] font-bold transition-colors border border-transparent hover:border-red-100"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>person_remove</span>
                      Remove User
                    </button>
                  </div>
                ))}
              </div>
              
              {usersList.length === 0 && (
                <div className="card-level-1 p-16 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined block mb-3" style={{ fontSize: "48px", opacity: 0.4 }}>person_off</span>
                  <p className="text-[16px] font-medium">No users found</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <ConfirmModal {...confirmModal} onCancel={() => setConfirmModal({ open: false })} />
      <ResourceFormModal open={resourceFormOpen} onClose={() => { setResourceFormOpen(false); setEditResource(null); }} onSubmit={handleResourceFormSubmit} editResource={editResource} />
      <ProfileModal 
        isOpen={profileOpen} 
        onClose={() => setProfileOpen(false)} 
        user={user}
        onUpdate={onUpdateUser}
      />

      <TextModal 
        isOpen={!!expandedText}
        onClose={() => setExpandedText(null)}
        title={expandedText?.title}
        content={expandedText?.content}
        themeColor={expandedText?.color}
      />
    </div>
  );
}

import { useState, useEffect } from "react";
import { getPendingReferenceBookings, teacherApprove, teacherReject } from "./api/bookingApi";
import { useToast } from "./components/Toast";
import cuetLogo from "./Photos/cuet-logo.png";

const statusConfig = {
  PENDING_REFERENCE: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "hourglass_top", label: "Awaiting Your Review" },
  PENDING_ADMIN: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "admin_panel_settings", label: "Sent to Admin" },
  CONFIRMED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "verified", label: "Confirmed" },
  REJECTED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "cancel", label: "Rejected" },
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

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", icon: "help", label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide border ${config.bg} ${config.text} ${config.border}`}>
      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>{config.icon}</span>
      {config.label || status?.replace(/_/g, " ")}
    </span>
  );
};

// Time-ago helper
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

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

// Calculate duration in hours
function getDuration(start, end) {
  if (!start || !end) return "—";
  const ms = new Date(end) - new Date(start);
  const hrs = Math.round(ms / 3600000);
  return hrs === 1 ? "1 hour" : `${hrs} hours`;
}

// Confirmation Modal
function ConfirmModal({ open, title, message, icon, iconColor, iconBg, onConfirm, onCancel, confirmText, confirmClass }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 modal-overlay" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-slide-up">
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
          <span className={`material-symbols-outlined ${iconColor}`} style={{ fontSize: "24px" }}>{icon}</span>
        </div>
        <h3 className="text-[18px] font-bold text-on-surface mb-1">{title}</h3>
        <p className="text-[14px] text-on-surface-variant mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-outline-variant/50 rounded-xl text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container-low transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:shadow-lg ${confirmClass}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeacherDashboard({ onLogout, user }) {
  const toast = useToast();
  const [activeNav, setActiveNav] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false });

  useEffect(() => {
    fetchRequests();
  }, [activeNav]);

  const fetchRequests = async () => {
    try {
      if (activeNav === "requests") {
        const data = await getPendingReferenceBookings();
        setRequests(data);
      }
    } catch (err) {
      console.error("Failed to fetch teacher requests", err);
      toast.error("Failed to load requests.");
    }
  };

  const handleApprove = (req) => {
    setConfirmModal({
      open: true,
      title: "Approve This Booking?",
      message: `You are about to approve ${req.studentName}'s request for "${req.resourceName}" on ${formatDate(req.startTime)}. This will forward the booking to admin for final confirmation.`,
      icon: "check_circle",
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      confirmText: "Approve & Forward",
      confirmClass: "bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-500/25",
      onConfirm: async () => {
        setConfirmModal({ open: false });
        try {
          await teacherApprove(req.bookingId);
          toast.success("Booking approved and forwarded to admin!", "Approved ✓");
          fetchRequests();
        } catch (err) {
          toast.error("Error approving: " + (err.response?.data?.message || err.message));
        }
      },
    });
  };

  const handleReject = (req) => {
    setConfirmModal({
      open: true,
      title: "Reject This Booking?",
      message: `You are about to reject ${req.studentName}'s request for "${req.resourceName}". The student will be notified of this decision.`,
      icon: "do_not_disturb_on",
      iconColor: "text-red-500",
      iconBg: "bg-red-50",
      confirmText: "Reject Booking",
      confirmClass: "bg-red-500 hover:bg-red-600 hover:shadow-red-500/25",
      onConfirm: async () => {
        setConfirmModal({ open: false });
        try {
          await teacherReject(req.bookingId);
          toast.warning("Booking rejected.", "Rejected");
          fetchRequests();
        } catch (err) {
          toast.error("Error rejecting: " + (err.response?.data?.message || err.message));
        }
      },
    });
  };

  const toggleExpand = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <div className="text-on-surface font-body-md min-h-screen overflow-x-hidden flex" style={{ background: "linear-gradient(135deg, #f8f9fc 0%, #eef0f7 50%, #f0f2fa 100%)" }}>
      {/* Side NavBar */}
      <nav className="hidden md:flex flex-col bg-white/80 backdrop-blur-xl border-r border-outline-variant/40 w-[260px] h-screen fixed left-0 top-0 z-40 p-md">
        <div className="flex items-center gap-sm mb-xl">
          <div className="w-11 h-11 gradient-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 overflow-hidden p-1">
            <img src={cuetLogo} alt="CUET Logo" className="w-full h-full object-contain bg-white rounded-lg" />
          </div>
          <div>
            <h1 className="text-headline-md font-headline-md text-primary font-bold tracking-tight">CUET</h1>
            <p className="text-label-sm font-label-sm text-on-surface-variant">Teacher Portal</p>
          </div>
        </div>
        <ul className="flex flex-col gap-xs flex-grow">
          {[
            { id: "requests", icon: "assignment", label: "Reference Requests" },
          ].map(({ id, icon, label }) => (
            <li key={id}>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setActiveNav(id); }}
                className={`flex items-center gap-md px-md py-[10px] rounded-xl transition-all duration-200 ${activeNav === id ? "bg-primary/8 text-primary font-semibold shadow-sm" : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"}`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px", fontVariationSettings: activeNav === id ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
                <span className="text-[13px]">{label}</span>
                {requests.length > 0 && (
                  <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">{requests.length}</span>
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
              <span className="text-[11px] text-on-surface-variant">Teacher Portal</span>
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
            <h2 className="text-[22px] font-bold text-on-surface tracking-tight">Reference Requests</h2>
            <p className="text-[12px] text-on-surface-variant mt-0.5">Students need your approval to proceed</p>
          </div>
          <div className="flex items-center gap-sm">
            <button onClick={fetchRequests} className="w-9 h-9 rounded-xl hover:bg-surface-container-low flex items-center justify-center transition-colors" title="Refresh">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "20px" }}>refresh</span>
            </button>
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 p-margin-mobile md:p-margin-desktop">
          {activeNav === "requests" && (
            <div className="animate-fade-in">

              {/* ═══════════════ Summary Stats Bar ═══════════════ */}
              {requests.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="card-level-1 p-4 flex items-center gap-3 animate-slide-up" style={{ animationDelay: "0s", animationFillMode: "both" }}>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                      <span className="material-symbols-outlined text-amber-600" style={{ fontSize: "22px" }}>pending_actions</span>
                    </div>
                    <div>
                      <p className="text-[24px] font-bold text-on-surface leading-none">{requests.length}</p>
                      <p className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wider mt-0.5">Pending Reviews</p>
                    </div>
                  </div>
                  <div className="card-level-1 p-4 flex items-center gap-3 animate-slide-up" style={{ animationDelay: "0.05s", animationFillMode: "both" }}>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <span className="material-symbols-outlined text-blue-600" style={{ fontSize: "22px" }}>school</span>
                    </div>
                    <div>
                      <p className="text-[24px] font-bold text-on-surface leading-none">{[...new Set(requests.map(r => r.studentId))].length}</p>
                      <p className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wider mt-0.5">Students Requesting</p>
                    </div>
                  </div>
                  <div className="card-level-1 p-4 flex items-center gap-3 animate-slide-up" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                      <span className="material-symbols-outlined text-purple-600" style={{ fontSize: "22px" }}>domain</span>
                    </div>
                    <div>
                      <p className="text-[24px] font-bold text-on-surface leading-none">{[...new Set(requests.map(r => r.resourceName))].length}</p>
                      <p className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wider mt-0.5">Resources Requested</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════ Empty State ═══════════════ */}
              {requests.length === 0 ? (
                <div className="card-level-1 overflow-hidden">
                  <div className="p-20 text-center text-on-surface-variant">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                      <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: "40px" }}>task_alt</span>
                    </div>
                    <p className="text-[20px] font-bold text-on-surface mb-1">All Caught Up!</p>
                    <p className="text-[14px] text-on-surface-variant max-w-sm mx-auto">No pending reference requests at the moment. You'll see student booking requests here when they select you as their reference teacher.</p>
                  </div>
                </div>
              ) : (

                /* ═══════════════ Request Cards ═══════════════ */
                <div className="space-y-4">
                  {requests.map((req, i) => {
                    const isExpanded = expandedCard === req.bookingId;
                    const resourceIcon = typeIcons[req.resourceType] || "domain";
                    const gradient = typeGradients[req.resourceType] || "from-primary to-primary";

                    return (
                      <div
                        key={req.bookingId}
                        className="card-level-1 overflow-hidden animate-slide-up transition-all duration-300"
                        style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}
                      >
                        {/* ── Card Header: Gradient accent + Resource type ── */}
                        <div className={`bg-gradient-to-r ${gradient} px-5 py-3 flex items-center justify-between`}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <span className="material-symbols-outlined text-white" style={{ fontSize: "20px" }}>{resourceIcon}</span>
                            </div>
                            <div>
                              <h3 className="text-[15px] font-bold text-white leading-tight">{req.resourceName}</h3>
                              <p className="text-[11px] text-white/80 font-medium">{req.resourceType || "Resource"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-white/70 font-medium bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm">
                              #{req.bookingId}
                            </span>
                          </div>
                        </div>

                        {/* ── Card Body ── */}
                        <div className="p-5">

                          {/* Status + Time ago row */}
                          <div className="flex items-center justify-between mb-4">
                            <StatusBadge status={req.status} />
                            <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>schedule</span>
                              Submitted {timeAgo(req.createdAt)}
                            </span>
                          </div>

                          {/* ── Info Grid ── */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                            {/* Student Info */}
                            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/50 border border-blue-100/70">
                              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="material-symbols-outlined text-blue-600" style={{ fontSize: "18px" }}>person</span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-0.5">Student</p>
                                <p className="text-[14px] font-semibold text-on-surface leading-snug truncate">{req.studentName}</p>
                                <p className="text-[11px] text-on-surface-variant truncate mt-0.5">{req.studentEmail}</p>
                              </div>
                            </div>

                            {/* Schedule Info */}
                            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100/70">
                              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: "18px" }}>event</span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5">Schedule</p>
                                <p className="text-[14px] font-semibold text-on-surface leading-snug">{formatDate(req.startTime)}</p>
                                <p className="text-[11px] text-on-surface-variant mt-0.5">
                                  {formatTime(req.startTime)} — {formatTime(req.endTime)} · {getDuration(req.startTime, req.endTime)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* ── Purpose Section ── */}
                          {req.purpose && (
                            <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-100/60 mb-4">
                              <div className="flex items-start gap-2.5">
                                <span className="material-symbols-outlined text-amber-500 flex-shrink-0 mt-0.5" style={{ fontSize: "18px" }}>description</span>
                                <div>
                                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Purpose of Booking</p>
                                  <p className="text-[13px] text-on-surface leading-relaxed">{req.purpose}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* ── Expandable Details ── */}
                          <button
                            onClick={() => toggleExpand(req.bookingId)}
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
                              maxHeight: isExpanded ? "300px" : "0px",
                              opacity: isExpanded ? 1 : 0,
                            }}
                          >
                            <div className="pt-3 border-t border-outline-variant/30">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="p-2.5 rounded-lg bg-surface-container-low/50">
                                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Booking ID</p>
                                  <p className="text-[13px] font-semibold text-on-surface">#{req.bookingId}</p>
                                </div>
                                <div className="p-2.5 rounded-lg bg-surface-container-low/50">
                                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Resource ID</p>
                                  <p className="text-[13px] font-semibold text-on-surface">#{req.resourceId}</p>
                                </div>
                                <div className="p-2.5 rounded-lg bg-surface-container-low/50">
                                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Duration</p>
                                  <p className="text-[13px] font-semibold text-on-surface">{getDuration(req.startTime, req.endTime)}</p>
                                </div>
                                <div className="p-2.5 rounded-lg bg-surface-container-low/50">
                                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-0.5">Submitted</p>
                                  <p className="text-[13px] font-semibold text-on-surface">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "—"}</p>
                                </div>
                              </div>

                              {/* Timeline visual */}
                              <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-primary/[0.03] to-primary/[0.07] border border-primary/10">
                                <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-3">Approval Flow</p>
                                <div className="flex items-center gap-0">
                                  {/* Step 1: Student */}
                                  <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                      <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: "16px" }}>check</span>
                                    </div>
                                    <p className="text-[9px] font-semibold text-emerald-600 mt-1">Student</p>
                                  </div>
                                  <div className="flex-1 h-[2px] bg-emerald-300 mx-1" />

                                  {/* Step 2: You (Teacher) — Active */}
                                  <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center animate-pulse">
                                      <span className="material-symbols-outlined text-amber-600" style={{ fontSize: "16px" }}>person</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-amber-600 mt-1">You</p>
                                  </div>
                                  <div className="flex-1 h-[2px] bg-gray-200 mx-1" />

                                  {/* Step 3: Admin */}
                                  <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                      <span className="material-symbols-outlined text-gray-400" style={{ fontSize: "16px" }}>shield_person</span>
                                    </div>
                                    <p className="text-[9px] font-medium text-gray-400 mt-1">Admin</p>
                                  </div>
                                  <div className="flex-1 h-[2px] bg-gray-200 mx-1" />

                                  {/* Step 4: Confirmed */}
                                  <div className="flex flex-col items-center flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                      <span className="material-symbols-outlined text-gray-400" style={{ fontSize: "16px" }}>verified</span>
                                    </div>
                                    <p className="text-[9px] font-medium text-gray-400 mt-1">Confirmed</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ── Action Buttons ── */}
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleApprove(req)}
                              className="flex-1 py-3 rounded-xl bg-emerald-500 text-white text-[13px] font-semibold hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
                            >
                              <span className="flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>check_circle</span>
                                Approve & Forward
                              </span>
                            </button>
                            <button
                              onClick={() => handleReject(req)}
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
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        {...confirmModal}
        onCancel={() => setConfirmModal({ open: false })}
      />
    </div>
  );
}

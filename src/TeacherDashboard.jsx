import { useState, useEffect } from "react";
import { getPendingReferenceBookings, teacherApprove, teacherReject } from "./api/bookingApi";
import { useToast } from "./components/Toast";
import cuetLogo from "./Photos/cuet-logo.png";

const statusConfig = {
  PENDING_REFERENCE: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "hourglass_top" },
  PENDING_ADMIN: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "admin_panel_settings" },
  CONFIRMED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "verified" },
  REJECTED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "cancel" },
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

export default function TeacherDashboard({ onLogout, user }) {
  const toast = useToast();
  const [activeNav, setActiveNav] = useState("requests");
  const [requests, setRequests] = useState([]);

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

  const handleApprove = async (id) => {
    try {
      await teacherApprove(id);
      toast.success("Booking approved and forwarded to admin!", "Approved");
      fetchRequests();
    } catch (err) {
      toast.error("Error approving: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (id) => {
    try {
      await teacherReject(id);
      toast.warning("Booking rejected.", "Rejected");
      fetchRequests();
    } catch (err) {
      toast.error("Error rejecting: " + (err.response?.data?.message || err.message));
    }
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
            { id: "requests", icon: "assignment", label: "Pending Requests" },
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
                  <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{requests.length}</span>
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
            <h2 className="text-[22px] font-bold text-on-surface tracking-tight">Pending Booking Requests</h2>
            <p className="text-[12px] text-on-surface-variant mt-0.5">Review and approve student bookings</p>
          </div>
          <div className="flex items-center gap-sm">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 p-margin-mobile md:p-margin-desktop">
          {activeNav === "requests" && (
            <div className="animate-fade-in">
              <div className="card-level-1 overflow-hidden">
                <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between">
                  <div>
                    <h3 className="text-[16px] font-bold text-on-surface">Requests Awaiting Your Approval</h3>
                    <p className="text-[12px] text-on-surface-variant mt-0.5">{requests.length} pending request(s)</p>
                  </div>
                </div>
                {requests.length === 0 ? (
                  <div className="p-16 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined block mb-3" style={{ fontSize: "48px", opacity: 0.4 }}>inbox</span>
                    <p className="text-[16px] font-medium">All caught up!</p>
                    <p className="text-[13px] mt-1">No pending reference requests.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-outline-variant/30">
                    {requests.map((req, i) => (
                      <div key={req.bookingId} className="p-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-primary/[0.02] transition-colors animate-slide-up" style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[12px] font-medium text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-md">#{req.bookingId}</span>
                            <StatusBadge status={req.status} />
                          </div>
                          <p className="text-[16px] font-semibold text-on-surface">{req.resourceName}</p>
                          <p className="text-[13px] text-on-surface-variant">Student: {req.studentName} ({req.studentEmail})</p>
                          <div className="flex items-center gap-1 mt-1 text-[12px] text-on-surface-variant">
                            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>schedule</span>
                            {new Date(req.startTime).toLocaleString()} — {new Date(req.endTime).toLocaleTimeString()}
                          </div>
                          {req.purpose && <p className="text-[12px] text-on-surface-variant mt-1 italic">Purpose: {req.purpose}</p>}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleApprove(req.bookingId)}
                            className="px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[12px] font-semibold hover:bg-emerald-100 transition-all"
                          >
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: "16px" }}>check</span> Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(req.bookingId)}
                            className="px-5 py-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-[12px] font-semibold hover:bg-red-100 transition-all"
                          >
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: "16px" }}>close</span> Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

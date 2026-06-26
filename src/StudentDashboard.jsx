import { useState, useEffect, useMemo } from "react";
import { getAllResources } from "./api/resourceApi";
import { createHold, submitBooking, getMyBookings, getBookingsForResourceOnDate, studentCancelBooking } from "./api/bookingApi";
import { getTeachers } from "./api/userApi";
import { useToast } from "./components/Toast";
import cuetLogo from "./Photos/cuet-logo.png";
import ProfileModal from "./components/ProfileModal";

const statusConfig = {
  AVAILABLE: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "check_circle" },
  HELD: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "schedule" },
  PENDING_REFERENCE: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "hourglass_top" },
  PENDING_ADMIN: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: "admin_panel_settings" },
  CONFIRMED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "verified" },
  REJECTED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "cancel" },
  TIMEOUT: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", icon: "timer_off" },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.AVAILABLE;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border ${config.bg} ${config.text} ${config.border}`}>
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

// ─────────────────────────────────────────────────────
// Generate hourly time slots for a resource
// ─────────────────────────────────────────────────────
function generateSlots(resource) {
  const startHour = resource.indoor ? 9 : 6;
  const endHour = resource.indoor ? 20 : 22;
  const slots = [];
  for (let h = startHour; h < endHour; h++) {
    slots.push({
      hour: h,
      label: `${String(h).padStart(2, "0")}:00 – ${String(h + 1).padStart(2, "0")}:00`,
      startTime: `${String(h).padStart(2, "0")}:00`,
      endTime: `${String(h + 1).padStart(2, "0")}:00`,
    });
  }
  return slots;
}

// ─────────────────────────────────────────────────────
// Check if a slot is booked
// ─────────────────────────────────────────────────────
function isSlotBooked(slot, date, bookings) {
  const slotStart = new Date(`${date}T${slot.startTime}:00`);
  const slotEnd = new Date(`${date}T${slot.endTime}:00`);
  return bookings.some((b) => {
    const bStart = new Date(b.startTime);
    const bEnd = new Date(b.endTime);
    return slotStart < bEnd && slotEnd > bStart;
  });
}

// ─────────────────────────────────────────────────────
// Slot Picker Component
// ─────────────────────────────────────────────────────
function SlotPicker({ resource, date, bookings, selectedSlots, onToggleSlot }) {
  const slots = useMemo(() => generateSlots(resource), [resource]);

  return (
    <div className="space-y-1.5">
      {slots.map((slot, i) => {
        const booked = isSlotBooked(slot, date, bookings);
        const selected = selectedSlots.includes(slot.hour);
        
        let bg, text, border, cursor, hoverClass;
        if (booked) {
          bg = "bg-red-50"; text = "text-red-400"; border = "border-red-200";
          cursor = "cursor-not-allowed opacity-60"; hoverClass = "";
        } else if (selected) {
          bg = "bg-primary/10"; text = "text-primary"; border = "border-primary/40";
          cursor = "cursor-pointer"; hoverClass = "hover:bg-primary/15";
        } else {
          bg = "bg-emerald-50/60"; text = "text-emerald-700"; border = "border-emerald-200/70";
          cursor = "cursor-pointer"; hoverClass = "hover:bg-emerald-100";
        }

        return (
          <button
            key={slot.hour}
            type="button"
            disabled={booked}
            onClick={() => !booked && onToggleSlot(slot.hour)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-[13px] font-medium transition-all duration-200 ${bg} ${text} ${border} ${cursor} ${hoverClass}`}
            style={{ animationDelay: `${i * 0.02}s` }}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                {booked ? "block" : selected ? "check_circle" : "radio_button_unchecked"}
              </span>
              <span className={selected ? "font-semibold" : ""}>{slot.label}</span>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
              booked ? "bg-red-100 text-red-500" : selected ? "bg-primary/15 text-primary" : "bg-emerald-100 text-emerald-600"
            }`}>
              {booked ? "Booked" : selected ? "Selected" : "Available"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// Confirmation Modal
// ─────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────
export default function StudentDashboard({ onLogout, user }) {
  const toast = useToast();
  const [activeNav, setActiveNav] = useState("book");
  const [filterType, setFilterType] = useState("All");

  const [resources, setResources] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);

  const [selectedResource, setSelectedResource] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingPurpose, setBookingPurpose] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [dateBookings, setDateBookings] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const uniqueTypes = [...new Set(resources.map((r) => r.type))].sort();
  const types = ["All", ...uniqueTypes];
  const filtered = filterType === "All" ? resources : resources.filter((r) => r.type === filterType);

  // Tomorrow's date for min date
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeNav]);

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings();
      
      const now = new Date();
      const sortedData = data.sort((a, b) => {
        const timeA = new Date(a.startTime);
        const timeB = new Date(b.startTime);
        const isPastA = timeA < now;
        const isPastB = timeB < now;

        if (isPastA && !isPastB) return 1;
        if (!isPastA && isPastB) return -1;

        if (!isPastA && !isPastB) {
          return timeA - timeB; // closest upcoming first
        } else {
          return timeB - timeA; // most recent past first
        }
      });
      
      setMyBookings(sortedData);
    } catch (err) {
      console.error("Failed to fetch my bookings", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Session expired. Please login again.");
        window.location.href = "/";
      } else {
        toast.error("Failed to load your bookings.");
      }
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeNav === "book") {
        const res = await getAllResources();
        setResources(res);
      } else if (activeNav === "mybookings") {
        await fetchBookings();
        const t = await getTeachers();
        setTeachers(t);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openPanel = (resource) => {
    setSelectedResource(resource);
    setPanelOpen(true);
    setError("");
    setBookingDate("");
    setBookingPurpose("");
    setSelectedSlots([]);
    setDateBookings([]);
  };

  // When date changes, fetch bookings for that resource+date
  const handleDateChange = async (date) => {
    setBookingDate(date);
    setSelectedSlots([]);
    if (!date || !selectedResource) return;
    setSlotsLoading(true);
    try {
      const bookings = await getBookingsForResourceOnDate(selectedResource.resourceId, date);
      setDateBookings(bookings);
    } catch (err) {
      console.error(err);
      setDateBookings([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  // Toggle slot selection — must be continuous
  const handleToggleSlot = (hour) => {
    setSelectedSlots((prev) => {
      if (prev.includes(hour)) {
        // Removing: only allow removing from edges
        if (hour === Math.min(...prev) || hour === Math.max(...prev)) {
          return prev.filter((h) => h !== hour);
        }
        // Can't remove from middle of continuous selection
        toast.warning("You can only deselect slots from the start or end.", "Continuous Selection");
        return prev;
      }
      
      if (prev.length === 0) return [hour];
      
      const min = Math.min(...prev);
      const max = Math.max(...prev);
      
      // Only allow adding adjacent slots
      if (hour === min - 1 || hour === max + 1) {
        return [...prev, hour].sort((a, b) => a - b);
      }
      
      // Not adjacent — check if we should start fresh
      toast.info("Select consecutive time slots. Click an adjacent slot to extend.", "Slot Selection");
      return [hour]; // Start fresh selection
    });
  };

  const handleCreateHold = async (e) => {
    e.preventDefault();
    setError("");
    
    if (selectedSlots.length === 0) {
      toast.warning("Please select at least one time slot.", "No Slots");
      return;
    }

    const sortedSlots = [...selectedSlots].sort((a, b) => a - b);
    const startHour = sortedSlots[0];
    const endHour = sortedSlots[sortedSlots.length - 1] + 1;
    
    const startTime = `${bookingDate}T${String(startHour).padStart(2, "0")}:00:00`;
    const endTime = `${bookingDate}T${String(endHour).padStart(2, "0")}:00:00`;

    try {
      await createHold({
        resourceId: selectedResource.resourceId,
        startTime,
        endTime,
        purpose: bookingPurpose,
      });
      toast.success(
        `Reserved ${sortedSlots.length} slot(s) from ${String(startHour).padStart(2, "0")}:00 to ${String(endHour).padStart(2, "0")}:00. Submit within 5 minutes!`,
        "Resource Held"
      );
      setPanelOpen(false);
      setActiveNav("mybookings");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || "Failed to create hold";
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      toast.error(typeof msg === 'string' ? msg : "Booking failed. Check constraints.", "Booking Failed");
    }
  };

  const handleSubmitBooking = async (bookingId, refTeacherId) => {
    if (!refTeacherId) {
      toast.warning("Please select a reference teacher before submitting.", "Teacher Required");
      return;
    }
    try {
      await submitBooking(bookingId, refTeacherId);
      toast.success("Booking submitted for teacher approval!", "Submitted");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit booking", "Submission Failed");
    }
  };

  const handleCancelBooking = (bookingId) => {
    setConfirmModal({
      open: true,
      title: "Cancel Reservation?",
      message: "Are you sure you want to cancel this reservation? This action cannot be undone.",
      icon: "event_busy",
      iconColor: "text-red-500",
      iconBg: "bg-red-50",
      confirmText: "Cancel Reservation",
      confirmClass: "bg-red-500 hover:bg-red-600 hover:shadow-red-500/25",
      onConfirm: async () => {
        setConfirmModal({ open: false });
        try {
          await studentCancelBooking(bookingId);
          toast.success("Reservation cancelled successfully.", "Cancelled");
          fetchData();
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to cancel reservation", "Cancel Failed");
        }
      },
    });
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
            <p className="text-label-sm font-label-sm text-on-surface-variant">Resource System</p>
          </div>
        </div>
        <ul className="flex flex-col gap-xs flex-grow">
          {[
            { id: "book", icon: "calendar_month", label: "Book a Resource" },
            { id: "mybookings", icon: "bookmark_border", label: "My Bookings" },
          ].map(({ id, icon, label }) => (
            <li key={id}>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setActiveNav(id); }}
                className={`flex items-center gap-md px-md py-[10px] rounded-xl transition-all duration-200 ${activeNav === id ? "bg-primary/8 text-primary font-semibold shadow-sm" : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"}`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "20px", fontVariationSettings: activeNav === id ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
                <span className="text-[13px]">{label}</span>
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
              <span className="text-[11px] text-on-surface-variant truncate">Student Portal</span>
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
              {activeNav === "book" ? "Available Resources" : "My Bookings"}
            </h2>
            <p className="text-[12px] text-on-surface-variant mt-0.5">
              {activeNav === "book" ? "Browse and book campus facilities" : "Track your reservation status"}
            </p>
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
          {activeNav === "book" && (
            <div className="animate-fade-in">
              {/* Filter Chips */}
              <div className="flex gap-2 flex-wrap mb-lg">
                {types.map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 rounded-full text-[12px] font-semibold border transition-all duration-250 ${
                      filterType === type
                        ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                        : "bg-white/80 text-on-surface-variant border-outline-variant/50 hover:bg-white hover:border-outline hover:shadow-sm"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Resource Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((resource, i) => (
                  <div
                    key={resource.resourceId}
                    className="card-level-1 overflow-hidden p-0 animate-slide-up"
                    style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}
                  >
                    <div className="h-2 gradient-primary rounded-t-lg" />
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary" style={{ fontSize: "22px" }}>
                              {typeIcons[resource.type] || "domain"}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-[16px] font-bold text-on-surface leading-tight">{resource.name}</h3>
                            <p className="text-[12px] text-on-surface-variant mt-0.5">{resource.type}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${resource.currentlyAvailable ? "badge-available" : "badge-unavailable"}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: resource.currentlyAvailable ? "#10b981" : "#ef4444" }} />
                          {resource.currentlyAvailable ? "AVAILABLE" : "IN USE"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mb-4 text-[13px] text-on-surface-variant">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>group</span>
                          Capacity: {resource.capacity}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>{resource.indoor ? "home" : "park"}</span>
                          {resource.indoor ? "Indoor" : "Outdoor"}
                        </div>
                      </div>

                      <button
                        onClick={() => openPanel(resource)}
                        className="w-full py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-250 gradient-primary text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>event_available</span>
                          Book Now
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {filtered.length === 0 && !loading && (
                <div className="text-center py-16 text-on-surface-variant">
                  <span className="material-symbols-outlined block mb-3" style={{ fontSize: "48px", opacity: 0.4 }}>search_off</span>
                  <p className="text-[16px] font-medium">No resources found</p>
                  <p className="text-[13px] mt-1">Try changing the filter or check back later.</p>
                </div>
              )}
            </div>
          )}

          {activeNav === "mybookings" && (
            <div className="animate-fade-in">
              <div className="card-level-1 overflow-hidden">
                  <div className="space-y-4 p-1">
                    {myBookings.map((b, i) => {
                      const resourceIcon = typeIcons[b.resourceType] || typeIcons[resources.find(r => r.name === b.resourceName)?.type] || "domain";
                      
                      return (
                        <div
                          key={b.bookingId}
                          className="card-level-1 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 animate-slide-up"
                          style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}
                        >
                          <div className="p-5 flex flex-col xl:flex-row gap-6">
                            
                            {/* Left Column: Resource & Schedule Details */}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-primary/20">
                                    <span className="material-symbols-outlined text-white" style={{ fontSize: "20px" }}>{resourceIcon}</span>
                                  </div>
                                  <div>
                                    <h3 className="text-[17px] font-bold text-on-surface leading-tight">{b.resourceName}</h3>
                                    <p className="text-[12px] font-medium text-primary mt-0.5">Booking #{b.bookingId}</p>
                                  </div>
                                </div>
                                <StatusBadge status={b.status} />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                <div className="bg-surface-container-low/50 rounded-xl p-3 border border-outline-variant/30">
                                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>calendar_today</span> Date
                                  </p>
                                  <p className="text-[13px] font-semibold text-on-surface">{new Date(b.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <div className="bg-surface-container-low/50 rounded-xl p-3 border border-outline-variant/30">
                                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>schedule</span> Time
                                  </p>
                                  <p className="text-[13px] font-semibold text-on-surface">
                                    {new Date(b.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} — {new Date(b.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>

                              {b.purpose && (
                                <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/50">
                                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Purpose</p>
                                  <p className="text-[13px] text-on-surface leading-relaxed">{b.purpose}</p>
                                </div>
                              )}

                              {b.teacherRemarks && (
                                <div className={`mt-3 rounded-xl p-3 border ${b.status === 'REJECTED' && !b.adminRemarks ? 'bg-red-50/50 border-red-200/50' : 'bg-purple-50/50 border-purple-200/50'}`}>
                                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${b.status === 'REJECTED' && !b.adminRemarks ? 'text-red-600' : 'text-purple-600'}`}>Teacher's Note</p>
                                  <p className="text-[13px] text-on-surface leading-relaxed">{b.teacherRemarks}</p>
                                </div>
                              )}

                              {b.adminRemarks && (
                                <div className={`mt-3 rounded-xl p-3 border ${b.status === 'REJECTED' ? 'bg-red-50/50 border-red-200/50' : 'bg-emerald-50/50 border-emerald-200/50'}`}>
                                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${b.status === 'REJECTED' ? 'text-red-600' : 'text-emerald-600'}`}>Admin's Note</p>
                                  <p className="text-[13px] text-on-surface leading-relaxed">{b.adminRemarks}</p>
                                </div>
                              )}
                            </div>

                            {/* Divider for desktop */}
                            <div className="hidden xl:block w-px bg-outline-variant/30 my-2"></div>

                            {/* Right Column: Approval Flow & Actions */}
                            <div className="xl:w-[360px] flex flex-col justify-between">
                              <div>
                                <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Approval Tracker</p>
                                <div className="bg-surface-container-low/30 rounded-xl p-3.5 border border-outline-variant/40 mb-4">
                                  <div className="flex items-center justify-between relative">
                                    {/* Timeline Background Line */}
                                    <div className="absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-outline-variant/30 -translate-y-1/2 z-0"></div>
                                    
                                    {/* Step 1: Held */}
                                    <div className="relative z-10 flex flex-col items-center gap-1.5">
                                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${b.status === "HELD" ? "bg-amber-100 border-2 border-amber-400 animate-pulse text-amber-600" : "bg-emerald-500 text-white"}`}>
                                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>{b.status === "HELD" ? "hourglass_empty" : "check"}</span>
                                      </div>
                                      <span className={`text-[9px] font-bold ${b.status === "HELD" ? "text-amber-600" : "text-emerald-600"}`}>Draft</span>
                                    </div>
                                    
                                    {/* Step 2: Reference */}
                                    <div className="relative z-10 flex flex-col items-center gap-1.5">
                                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${b.status === "PENDING_REFERENCE" ? "bg-blue-100 border-2 border-blue-400 animate-pulse text-blue-600" : b.status === "HELD" ? "bg-white border border-outline-variant text-on-surface-variant" : "bg-emerald-500 text-white"}`}>
                                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>{b.status === "PENDING_REFERENCE" ? "person_search" : b.status === "HELD" ? "person" : "check"}</span>
                                      </div>
                                      <span className={`text-[9px] font-bold ${b.status === "PENDING_REFERENCE" ? "text-blue-600" : "text-on-surface-variant"}`}>Teacher</span>
                                    </div>

                                    {/* Step 3: Admin */}
                                    <div className="relative z-10 flex flex-col items-center gap-1.5">
                                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${b.status === "PENDING_ADMIN" ? "bg-purple-100 border-2 border-purple-400 animate-pulse text-purple-600" : b.status === "CONFIRMED" ? "bg-emerald-500 text-white" : "bg-white border border-outline-variant text-on-surface-variant"}`}>
                                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>{b.status === "PENDING_ADMIN" ? "admin_panel_settings" : b.status === "CONFIRMED" ? "check" : "shield_person"}</span>
                                      </div>
                                      <span className={`text-[9px] font-bold ${b.status === "PENDING_ADMIN" ? "text-purple-600" : "text-on-surface-variant"}`}>Admin</span>
                                    </div>
                                  </div>
                                  
                                  {b.referenceTeacherName && b.status !== "HELD" && (
                                    <div className="mt-3 pt-3 border-t border-outline-variant/30 flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold">
                                        {b.referenceTeacherName.charAt(0)}
                                      </div>
                                      <div className="text-[11px]">
                                        <span className="text-on-surface-variant">Reviewer: </span>
                                        <span className="font-semibold text-on-surface">{b.referenceTeacherName}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Action Section */}
                              <div>
                                {b.status === "HELD" ? (
                                  <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-3.5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                                      <span className="material-symbols-outlined" style={{ fontSize: "60px" }}>warning</span>
                                    </div>
                                    <div className="relative z-10">
                                      <p className="text-[12px] font-bold text-amber-700 mb-1">Action Required</p>
                                      <p className="text-[11px] text-amber-600/90 mb-3 leading-tight">You must select a reference teacher to forward this booking for approval, otherwise it will expire.</p>
                                      
                                      <div className="flex flex-col sm:flex-row gap-2">
                                        <div className="relative flex-1">
                                          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-amber-600/50" style={{ fontSize: "16px" }}>person_search</span>
                                          <select 
                                            id={`teacher-select-${b.bookingId}`} 
                                            className="w-full pl-8 pr-3 py-2 text-[12px] bg-white border border-amber-200 rounded-lg text-on-surface focus:ring-2 focus:ring-amber-400 outline-none transition-shadow font-medium appearance-none"
                                            style={{ backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d97706' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1em" }}
                                          >
                                            <option value="" disabled selected>Select Reference Teacher...</option>
                                            {teachers.map((t) => (
                                              <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                          </select>
                                        </div>
                                        <button
                                          onClick={() => {
                                            const val = document.getElementById(`teacher-select-${b.bookingId}`).value;
                                            handleSubmitBooking(b.bookingId, val);
                                          }}
                                          className="px-4 py-2 rounded-lg bg-amber-500 text-white text-[12px] font-bold hover:bg-amber-600 hover:shadow-md transition-all sm:w-auto w-full flex items-center justify-center gap-1"
                                        >
                                          Submit <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>send</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex gap-2">
                                    <div className={`flex-1 px-3 py-2.5 rounded-xl border text-center flex items-center justify-center gap-1.5 ${
                                      b.status === "CONFIRMED" ? "bg-emerald-50 border-emerald-200" :
                                      b.status === "REJECTED" ? "bg-red-50 border-red-200" :
                                      "bg-surface-container-low/50 border-outline-variant/30"
                                    }`}>
                                      <span className={`material-symbols-outlined ${
                                        b.status === "CONFIRMED" ? "text-emerald-600" :
                                        b.status === "REJECTED" ? "text-red-600" :
                                        "text-primary/70"
                                      }`} style={{ fontSize: "16px" }}>
                                        {b.status === "CONFIRMED" ? "check_circle" : b.status === "REJECTED" ? "cancel" : "info"}
                                      </span>
                                      <span className={`text-[12px] font-medium ${
                                        b.status === "CONFIRMED" ? "text-emerald-700" :
                                        b.status === "REJECTED" ? "text-red-700" :
                                        "text-on-surface-variant"
                                      }`}>
                                        {b.status === "CONFIRMED" ? "Booking Confirmed! You can now use the resource." :
                                         b.status === "REJECTED" ? "This booking request was rejected." :
                                         b.status === "PENDING_REFERENCE" ? "Waiting for Teacher Approval" :
                                         "Waiting for Admin Approval"}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                
                                {(b.status === "HELD" || b.status === "PENDING_REFERENCE") && (
                                  <button
                                    onClick={() => handleCancelBooking(b.bookingId)}
                                    className="mt-2 w-full py-2 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 text-[12px] font-semibold transition-colors flex items-center justify-center gap-1"
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>cancel</span>
                                    Cancel Booking
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {myBookings.length === 0 && (
                    <div className="card-level-1 p-16 text-center text-on-surface-variant">
                      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: "40px" }}>event_busy</span>
                      </div>
                      <p className="text-[20px] font-bold text-on-surface mb-1">No bookings yet</p>
                      <p className="text-[14px] text-on-surface-variant max-w-sm mx-auto">Start by booking a resource from the available list. Your active and past bookings will appear here.</p>
                    </div>
                  )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ═══════════════════ Booking Panel ═══════════════════ */}
      {panelOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 modal-overlay" onClick={() => setPanelOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-slide-up">
            {/* Header */}
            <div className="flex-shrink-0 bg-white/95 backdrop-blur-xl z-10 p-lg pb-4 border-b border-outline-variant/30 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-[20px] font-bold text-on-surface">Book Resource</h3>
                  <p className="text-[12px] text-on-surface-variant mt-0.5">Select date & time slots</p>
                </div>
                <button onClick={() => setPanelOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-lg pt-4">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[13px] font-medium flex items-start gap-2">
                  <span className="material-symbols-outlined flex-shrink-0 mt-0.5" style={{ fontSize: "18px" }}>error</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Resource Info Card */}
              <div className="mb-5 p-4 gradient-card rounded-xl border border-outline-variant/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: "22px" }}>
                      {typeIcons[selectedResource?.type] || "domain"}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-[15px] font-semibold text-on-surface">{selectedResource?.name}</h4>
                    <p className="text-[12px] text-on-surface-variant">
                      {selectedResource?.type} · Capacity {selectedResource?.capacity} · {selectedResource?.indoor ? `${selectedResource?.openTime?.substring(0,5)} – ${selectedResource?.closeTime?.substring(0,5)}` : "Open 24/7"}
                    </p>
                  </div>
                </div>
              </div>

              <form id="booking-form" onSubmit={handleCreateHold} className="space-y-5 pb-4">
                {/* Date Picker */}
                <div>
                  <label className="block text-[12px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>calendar_today</span>
                      Select Date
                    </span>
                  </label>
                  <input
                    type="date"
                    required
                    min={tomorrow}
                    value={bookingDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="input-standard w-full px-3 py-2.5 text-[14px] text-on-surface bg-white rounded-xl"
                  />
                  <p className="text-[11px] text-on-surface-variant mt-1">Bookings available from tomorrow onwards</p>
                </div>

                {/* Time Slot Grid */}
                {bookingDate && (
                  <div className="animate-slide-up">
                    <label className="block text-[12px] font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>schedule</span>
                        Select Time Slots
                      </span>
                    </label>
                    
                    {/* Legend */}
                    <div className="flex gap-4 mb-3">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-200" />
                        <span className="text-on-surface-variant">Available</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-200" />
                        <span className="text-on-surface-variant">Booked</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="w-3 h-3 rounded-sm bg-primary/15 border border-primary/30" />
                        <span className="text-on-surface-variant">Selected</span>
                      </div>
                    </div>

                    {slotsLoading ? (
                      <div className="py-8 text-center text-on-surface-variant">
                        <svg className="animate-spin h-6 w-6 mx-auto mb-2 text-primary" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <p className="text-[13px]">Loading availability...</p>
                      </div>
                    ) : (
                      <div className="max-h-[320px] overflow-y-auto pr-1">
                        <SlotPicker
                          resource={selectedResource}
                          date={bookingDate}
                          bookings={dateBookings}
                          selectedSlots={selectedSlots}
                          onToggleSlot={handleToggleSlot}
                        />
                      </div>
                    )}

                    {selectedSlots.length > 0 && (
                      <div className="mt-3 p-3 bg-primary/5 rounded-xl border border-primary/15">
                        <p className="text-[12px] font-semibold text-primary">
                          Selected: {String(Math.min(...selectedSlots)).padStart(2, "0")}:00 – {String(Math.max(...selectedSlots) + 1).padStart(2, "0")}:00 ({selectedSlots.length} hour{selectedSlots.length > 1 ? "s" : ""})
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Sticky Footer */}
            <div className="flex-shrink-0 bg-white border-t border-outline-variant/30 p-lg rounded-b-2xl">
              {/* Purpose */}
              <div className="mb-4">
                <label className="block text-[12px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">Purpose</label>
                <textarea
                  form="booking-form"
                  required
                  rows={2}
                  value={bookingPurpose}
                  onChange={(e) => setBookingPurpose(e.target.value)}
                  placeholder="Describe the purpose of booking..."
                  className="input-standard w-full px-3 py-2.5 text-[14px] text-on-surface bg-surface-container-lowest resize-none rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none border border-outline-variant/50"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button type="button" onClick={() => setPanelOpen(false)} className="flex-1 py-3 border border-outline-variant/50 rounded-xl text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container-low transition-all">
                  Cancel
                </button>
                <button
                  type="submit"
                  form="booking-form"
                  disabled={selectedSlots.length === 0}
                  className="flex-1 py-3 rounded-xl text-[13px] font-semibold transition-all bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>verified</span>
                    Confirm Booking
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        {...confirmModal}
        onCancel={() => setConfirmModal({ open: false })}
      />

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}

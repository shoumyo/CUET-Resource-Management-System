import { useState, useEffect, useMemo } from "react";
import { getAllResources } from "./api/resourceApi";
import { createHold, submitBooking, getMyBookings, getBookingsForResourceOnDate } from "./api/bookingApi";
import { getTeachers } from "./api/userApi";
import { useToast } from "./components/Toast";
import cuetLogo from "./Photos/cuet-logo.png";

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
// Main Dashboard
// ─────────────────────────────────────────────────────
export default function StudentDashboard({ onLogout, user }) {
  const toast = useToast();
  const [activeNav, setActiveNav] = useState("book");
  const [filterType, setFilterType] = useState("All");

  const [resources, setResources] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [selectedResource, setSelectedResource] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingPurpose, setBookingPurpose] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [dateBookings, setDateBookings] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
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

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeNav === "book") {
        const res = await getAllResources();
        setResources(res);
      } else if (activeNav === "mybookings") {
        const b = await getMyBookings();
        setMyBookings(b);
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
          <div className="flex items-center gap-sm mb-sm">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-on-surface">{user?.name}</span>
              <span className="text-[11px] text-on-surface-variant">Student Portal</span>
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
              {activeNav === "book" ? "Available Resources" : "My Bookings"}
            </h2>
            <p className="text-[12px] text-on-surface-variant mt-0.5">
              {activeNav === "book" ? "Browse and book campus facilities" : "Track your reservation status"}
            </p>
          </div>
          <div className="flex items-center gap-sm">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {user?.name?.charAt(0)}
            </div>
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
                <div className="divide-y divide-outline-variant/30">
                  {myBookings.map((b, i) => (
                    <div
                      key={b.bookingId}
                      className="p-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-primary/[0.02] transition-colors animate-slide-up"
                      style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[12px] font-medium text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-md">#{b.bookingId}</span>
                          <StatusBadge status={b.status} />
                        </div>
                        <p className="text-[16px] font-semibold text-on-surface">{b.resourceName}</p>
                        <div className="flex items-center gap-1 mt-1 text-[13px] text-on-surface-variant">
                          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>schedule</span>
                          {new Date(b.startTime).toLocaleString()} — {new Date(b.endTime).toLocaleTimeString()}
                        </div>
                        {b.purpose && (
                          <p className="text-[12px] text-on-surface-variant mt-1 italic">Purpose: {b.purpose}</p>
                        )}
                      </div>
                      {b.status === "HELD" && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <select id={`teacher-select-${b.bookingId}`} className="input-standard px-3 py-2 text-[13px] bg-white rounded-xl min-w-[180px]">
                            <option value="">Select Ref Teacher</option>
                            {teachers.map((t) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              const val = document.getElementById(`teacher-select-${b.bookingId}`).value;
                              handleSubmitBooking(b.bookingId, val);
                            }}
                            className="px-4 py-2 rounded-xl gradient-primary text-white text-[12px] font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all"
                          >
                            Submit
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {myBookings.length === 0 && (
                    <div className="p-16 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined block mb-3" style={{ fontSize: "48px", opacity: 0.4 }}>event_busy</span>
                      <p className="text-[16px] font-medium">No bookings yet</p>
                      <p className="text-[13px] mt-1">Start by booking a resource from the available list.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ═══════════════════ Booking Panel ═══════════════════ */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 modal-overlay" onClick={() => setPanelOpen(false)} />
          <div className="relative panel-level-2 w-full max-w-lg h-full overflow-y-auto slide-panel open">
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl z-10 p-lg pb-4 border-b border-outline-variant/30">
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
            
            <div className="p-lg pt-4">
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

              <form onSubmit={handleCreateHold} className="space-y-5">
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

                {/* Purpose */}
                <div>
                  <label className="block text-[12px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">Purpose</label>
                  <textarea
                    required
                    rows={2}
                    value={bookingPurpose}
                    onChange={(e) => setBookingPurpose(e.target.value)}
                    placeholder="Describe the purpose of booking..."
                    className="input-standard w-full px-3 py-2.5 text-[14px] text-on-surface bg-white resize-none rounded-xl"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setPanelOpen(false)} className="flex-1 py-2.5 border border-outline-variant/50 rounded-xl text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container-low transition-all">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={selectedSlots.length === 0}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>timer</span>
                      Hold (5 Mins)
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

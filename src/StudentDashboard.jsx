import { useState, useEffect } from "react";
import { getAllResources } from "./api/resourceApi";
import { createHold, submitBooking, getMyBookings } from "./api/bookingApi";
import { getTeachers } from "./api/userApi";
import { useToast } from "./components/Toast";

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

// Resource type icons
const typeIcons = {
  "Gallery": "museum",
  "Auditorium": "theater_comedy",
  "Hall": "meeting_room",
  "Outdoor Field": "sports_soccer",
  "Lab": "science",
  "Seminar Room": "groups",
  "Conference Room": "video_call",
};

export default function StudentDashboard({ onLogout, user }) {
  const toast = useToast();
  const [activeNav, setActiveNav] = useState("book");
  const [filterType, setFilterType] = useState("All");

  const [resources, setResources] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [selectedResource, setSelectedResource] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingPurpose, setBookingPurpose] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Derive filter types dynamically from actual resource data
  const uniqueTypes = [...new Set(resources.map((r) => r.type))].sort();
  const types = ["All", ...uniqueTypes];
  const filtered = filterType === "All" ? resources : resources.filter((r) => r.type === filterType);

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
    setBookingTime("");
    setBookingPurpose("");
  };

  const handleCreateHold = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Create start/end time from date + time slot
      const [startH, startM] = bookingTime.split(" - ")[0].split(":");
      const [endH, endM] = bookingTime.split(" - ")[1].split(":");

      const startTime = new Date(`${bookingDate}T${startH}:${startM}:00`).toISOString();
      const endTime = new Date(`${bookingDate}T${endH}:${endM}:00`).toISOString();

      await createHold({
        resourceId: selectedResource.resourceId,
        startTime,
        endTime,
        purpose: bookingPurpose,
      });
      toast.success(
        "Hold created! You have 5 minutes to submit it with a reference teacher.",
        "Resource Held"
      );
      setPanelOpen(false);
      setActiveNav("mybookings");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to create hold";
      setError(msg);
      toast.error(msg, "Booking Failed");
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
          <div className="w-11 h-11 gradient-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>school</span>
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
                    {/* Card Header Gradient */}
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
                        {/* Availability Badge */}
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

      {/* Booking Panel Overlay */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 modal-overlay" onClick={() => setPanelOpen(false)} />
          <div className="relative panel-level-2 w-full max-w-md h-full overflow-y-auto p-lg slide-panel open">
            <div className="flex justify-between items-center mb-lg">
              <div>
                <h3 className="text-[20px] font-bold text-on-surface">Hold Resource</h3>
                <p className="text-[12px] text-on-surface-variant mt-0.5">Reserve for 5 minutes while you finalize</p>
              </div>
              <button onClick={() => setPanelOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[13px] font-medium flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>error</span>
                {error}
              </div>
            )}
            <div className="mb-lg p-4 gradient-card rounded-xl border border-outline-variant/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: "22px" }}>
                    {typeIcons[selectedResource?.type] || "domain"}
                  </span>
                </div>
                <div>
                  <h4 className="text-[15px] font-semibold text-on-surface">{selectedResource?.name}</h4>
                  <p className="text-[12px] text-on-surface-variant">{selectedResource?.type} · Capacity {selectedResource?.capacity}</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleCreateHold} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">Date</label>
                <input type="date" required value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="input-standard w-full px-3 py-2.5 text-[14px] text-on-surface bg-white rounded-xl" />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">Time Slot (min 2 hours)</label>
                <select required value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} className="input-standard w-full px-3 py-2.5 text-[14px] text-on-surface bg-white rounded-xl">
                  <option value="">Select time...</option>
                  <option>09:00 - 11:00</option>
                  <option>11:00 - 13:00</option>
                  <option>14:00 - 16:00</option>
                  <option>16:00 - 18:00</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">Purpose</label>
                <textarea required rows={3} value={bookingPurpose} onChange={(e) => setBookingPurpose(e.target.value)} placeholder="Describe the purpose of booking..." className="input-standard w-full px-3 py-2.5 text-[14px] text-on-surface bg-white resize-none rounded-xl" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setPanelOpen(false)} className="flex-1 py-2.5 border border-outline-variant/50 rounded-xl text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container-low transition-all">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/25">
                  <span className="flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>timer</span>
                    Hold (5 Mins)
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

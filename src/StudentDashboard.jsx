import { useState, useEffect } from "react";
import { getAllResources } from "./api/resourceApi";
import { createHold, submitBooking, getMyBookings } from "./api/bookingApi";
import { getTeachers } from "./api/userApi";

const statusBadge = (status) => {
  const styles = {
    AVAILABLE: "bg-emerald-100 text-emerald-700",
    HELD: "bg-amber-100 text-amber-700",
    PENDING_REFERENCE: "bg-blue-100 text-blue-700",
    PENDING_ADMIN: "bg-purple-100 text-purple-700",
    CONFIRMED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-700",
    TIMEOUT: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`px-sm py-[2px] rounded-full text-label-sm font-label-sm ${styles[status] || "bg-surface-container text-on-surface-variant"}`}>
      {status}
    </span>
  );
};

export default function StudentDashboard({ onLogout, user }) {
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

  const types = ["All", "Gallery", "Auditorium", "Hall", "Outdoor Field"];
  const filtered = filterType === "All" ? resources : resources.filter(r => r.type === filterType);

  useEffect(() => {
    fetchData();
  }, [activeNav]);

  const fetchData = async () => {
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
    }
  };

  const openPanel = (resource) => {
    setSelectedResource(resource);
    setPanelOpen(true);
    setError("");
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
        purpose: bookingPurpose
      });
      alert("Hold created successfully! You have 5 minutes to submit it with a reference teacher in 'My Bookings'.");
      setPanelOpen(false);
      setActiveNav("mybookings");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create hold");
    }
  };

  const handleSubmitBooking = async (bookingId, refTeacherId) => {
    if (!refTeacherId) return alert("Select a reference teacher");
    try {
      await submitBooking(bookingId, refTeacherId);
      alert("Booking submitted for teacher approval!");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit booking");
    }
  };

  return (
    <div className="text-on-surface font-body-md min-h-screen overflow-x-hidden flex" style={{backgroundColor: "#F9FAFB"}}>
      {/* Side NavBar */}
      <nav className="hidden md:flex flex-col bg-surface-container-lowest border-r border-outline-variant w-64 h-screen fixed left-0 top-0 z-40 p-md">
        <div className="flex items-center gap-sm mb-xl">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">C</div>
          <div>
            <h1 className="text-headline-md font-headline-md text-primary font-bold">CUET</h1>
            <p className="text-label-md font-label-md text-on-surface-variant">Resource System</p>
          </div>
        </div>
        <ul className="flex flex-col gap-sm flex-grow">
          {[
            { id: "book", icon: "event_available", label: "Book a Resource" },
            { id: "mybookings", icon: "bookmark", label: "My Bookings" },
          ].map(({ id, icon, label }) => (
            <li key={id}>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setActiveNav(id); }}
                className={`flex items-center gap-md px-md py-sm rounded-lg transition-colors duration-200 ${activeNav === id ? "bg-secondary-container text-primary font-bold" : "text-secondary hover:bg-surface-container-low"}`}
              >
                <span className="material-symbols-outlined">{icon}</span>
                <span className="text-label-md font-label-md">{label}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-md border-t border-outline-variant">
          <div className="flex items-center gap-sm">
            <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center">
              <span className="material-symbols-outlined text-sm text-primary">school</span>
            </div>
            <div className="flex flex-col">
              <span className="text-label-md font-label-md text-on-surface">{user?.name}</span>
              <span className="text-label-sm font-label-sm text-on-surface-variant">Student Portal</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="mt-sm w-full text-left flex items-center gap-md px-md py-sm text-error hover:bg-error-container rounded-lg transition-colors duration-200 text-label-md font-label-md"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        <header className="bg-surface-container-lowest border-b border-outline-variant px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h2 className="text-headline-md font-headline-md text-on-surface font-semibold">
              {activeNav === "book" ? "Available Resources" : "My Bookings"}
            </h2>
          </div>
          <div className="flex items-center gap-sm">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary text-label-md font-bold">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 p-margin-mobile md:p-margin-desktop">
          {activeNav === "book" && (
            <>
              <div className="flex gap-sm flex-wrap mb-lg">
                {types.map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-md py-sm rounded-full text-label-md font-label-md border transition-colors duration-200 ${filterType === type ? "bg-primary-container text-on-primary border-primary-container" : "bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container-low"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                {filtered.map((resource) => (
                  <div key={resource.resourceId} className="card-level-1 rounded-lg overflow-hidden p-md">
                    <h3 className="text-headline-md font-headline-md text-on-surface font-semibold mb-xs">{resource.name}</h3>
                    <div className="flex items-center gap-xs text-on-surface-variant mb-xs">
                      <span className="text-body-md font-body-md">{resource.type}</span>
                    </div>
                    <div className="flex items-center gap-xs text-on-surface-variant mb-xs">
                      <span className="text-body-md font-body-md">Capacity: {resource.capacity}</span>
                    </div>
                    <button
                      onClick={() => openPanel(resource)}
                      className="w-full mt-md py-sm rounded-lg text-label-md font-label-md transition-colors duration-200 bg-primary-container text-on-primary hover:bg-primary"
                    >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeNav === "mybookings" && (
            <div className="card-level-1 rounded-lg overflow-hidden">
              <div className="divide-y divide-outline-variant">
                {myBookings.map((b) => (
                  <div key={b.bookingId} className="p-md flex flex-col md:flex-row md:items-center gap-md">
                    <div className="flex-1">
                      <div className="flex items-center gap-sm mb-xs">
                        <span className="text-label-md font-label-md text-on-surface-variant">ID: {b.bookingId}</span>
                        {statusBadge(b.status)}
                      </div>
                      <p className="text-body-lg font-body-lg text-on-surface font-semibold">{b.resourceName}</p>
                      <p className="text-body-md font-body-md text-on-surface-variant">
                        {new Date(b.startTime).toLocaleString()} - {new Date(b.endTime).toLocaleTimeString()}
                      </p>
                    </div>
                    {b.status === "HELD" && (
                      <div className="flex items-center gap-sm">
                        <select id={`teacher-select-${b.bookingId}`} className="p-2 border rounded">
                          <option value="">Select Ref Teacher</option>
                          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <button
                          onClick={() => {
                            const val = document.getElementById(`teacher-select-${b.bookingId}`).value;
                            handleSubmitBooking(b.bookingId, val);
                          }}
                          className="px-md py-sm rounded-lg bg-primary text-white text-label-md font-label-md hover:bg-blue-600 transition-colors"
                        >
                          Submit
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {myBookings.length === 0 && <div className="p-md text-center">No bookings found.</div>}
              </div>
            </div>
          )}
        </main>
      </div>

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setPanelOpen(false)}></div>
          <div className="relative panel-level-2 w-full max-w-md h-full overflow-y-auto p-lg slide-panel open bg-white">
            <div className="flex justify-between items-center mb-lg">
              <h3 className="text-headline-md font-headline-md text-on-surface font-semibold">Hold Resource</h3>
              <button onClick={() => setPanelOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {error && <div className="mb-4 text-red-500 font-bold">{error}</div>}
            <div className="mb-lg p-md bg-surface-container-low rounded-lg">
              <h4 className="text-label-md font-label-md text-on-surface font-semibold">{selectedResource?.name}</h4>
              <p className="text-body-md font-body-md text-on-surface-variant">{selectedResource?.type} · Capacity {selectedResource?.capacity}</p>
            </div>
            <form onSubmit={handleCreateHold} className="space-y-md">
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-unit uppercase tracking-wide">Date</label>
                <input type="date" required value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="input-standard w-full px-sm py-sm text-body-md font-body-md text-on-surface bg-surface-container-lowest" />
              </div>
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-unit uppercase tracking-wide">Time Slot (min 2 hours)</label>
                <select required value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="input-standard w-full px-sm py-sm text-body-md font-body-md text-on-surface bg-surface-container-lowest">
                  <option value="">Select time...</option>
                  <option>09:00 - 11:00</option>
                  <option>11:00 - 13:00</option>
                  <option>14:00 - 16:00</option>
                  <option>16:00 - 18:00</option>
                </select>
              </div>
              <div>
                <label className="block text-label-md font-label-md text-on-surface-variant mb-unit uppercase tracking-wide">Purpose</label>
                <textarea required rows={3} value={bookingPurpose} onChange={e => setBookingPurpose(e.target.value)} placeholder="Describe the purpose of booking..." className="input-standard w-full px-sm py-sm text-body-md font-body-md text-on-surface bg-surface-container-lowest resize-none" />
              </div>
              <div className="flex gap-sm pt-sm">
                <button type="button" onClick={() => setPanelOpen(false)} className="flex-1 py-sm border border-outline-variant rounded-lg text-label-md font-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-sm bg-amber-500 text-white rounded-lg text-label-md font-label-md hover:bg-amber-600 transition-colors">Hold (5 Mins)</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

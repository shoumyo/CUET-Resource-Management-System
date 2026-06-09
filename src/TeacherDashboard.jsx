import { useState, useEffect } from "react";
import { getPendingReferenceBookings, teacherApprove, teacherReject } from "./api/bookingApi";

const statusBadge = (status) => {
  const styles = {
    PENDING_REFERENCE: "bg-amber-100 text-amber-700",
    PENDING_ADMIN: "bg-blue-100 text-blue-700",
    CONFIRMED: "bg-emerald-100 text-emerald-700",
    REJECTED: "bg-red-100 text-red-700",
  };
  return <span className={`px-sm py-[2px] rounded-full text-label-sm font-label-sm ${styles[status] || "bg-gray-100"}`}>{status}</span>;
};

export default function TeacherDashboard({ onLogout, user }) {
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
    }
  };

  const handleApprove = async (id) => {
    try {
      await teacherApprove(id);
      fetchRequests();
    } catch (err) {
      alert("Error approving booking: " + err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await teacherReject(id);
      fetchRequests();
    } catch (err) {
      alert("Error rejecting booking: " + err.message);
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
            { id: "requests", icon: "assignment", label: "Pending Requests" },
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
              <span className="material-symbols-outlined text-sm text-primary">person</span>
            </div>
            <div className="flex flex-col">
              <span className="text-label-md font-label-md text-on-surface">{user?.name}</span>
              <span className="text-label-sm font-label-sm text-on-surface-variant">Teacher Portal</span>
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
            <h2 className="text-headline-md font-headline-md text-on-surface font-semibold">Pending Booking Requests</h2>
          </div>
          <div className="flex items-center gap-sm">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary text-label-md font-bold">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 p-margin-mobile md:p-margin-desktop">
          {activeNav === "requests" && (
            <div className="card-level-1 rounded-lg overflow-hidden">
              <div className="p-md border-b border-outline-variant">
                <h3 className="text-headline-md font-headline-md text-on-surface font-semibold">Requests Awaiting Your Reference Approval</h3>
              </div>
              {requests.length === 0 ? (
                <div className="p-xl text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[48px] block mb-sm">inbox</span>
                  No pending requests.
                </div>
              ) : (
                <div className="divide-y divide-outline-variant">
                  {requests.map((req) => (
                    <div key={req.bookingId} className="p-md flex flex-col md:flex-row md:items-center gap-md">
                      <div className="flex-1">
                        <div className="flex items-center gap-sm mb-xs">
                          <span className="text-label-md font-label-md text-on-surface-variant">ID: {req.bookingId}</span>
                          {statusBadge(req.status)}
                        </div>
                        <p className="text-body-lg font-body-lg text-on-surface font-semibold">{req.resourceName}</p>
                        <p className="text-body-md font-body-md text-on-surface-variant">Student: {req.studentName} ({req.studentEmail})</p>
                        <p className="text-body-md font-body-md text-on-surface-variant">
                          Time: {new Date(req.startTime).toLocaleString()} - {new Date(req.endTime).toLocaleTimeString()}
                        </p>
                        <p className="text-body-md font-body-md text-on-surface-variant italic">Purpose: {req.purpose}</p>
                      </div>
                      <div className="flex gap-sm">
                        <button
                          onClick={() => handleApprove(req.bookingId)}
                          className="px-md py-sm rounded-lg bg-emerald-100 text-emerald-700 text-label-md font-label-md hover:bg-emerald-200 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(req.bookingId)}
                          className="px-md py-sm rounded-lg bg-error-container text-on-error-container text-label-md font-label-md hover:bg-red-200 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

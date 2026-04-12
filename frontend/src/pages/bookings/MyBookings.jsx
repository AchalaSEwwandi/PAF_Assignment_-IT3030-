import React, { useState, useEffect } from "react";
import axios from "axios";

/**
 * MyBookings.jsx – Module B: Booking Management
 * Displays all bookings for the currently logged-in user.
 * Allows the user to cancel PENDING or APPROVED bookings.
 */

// ─── Status badge styles ────────────────────────────────────────────────────
const STATUS_STYLES = {
  PENDING:   "bg-yellow-100 text-yellow-800 border-yellow-200",
  APPROVED:  "bg-green-100 text-green-800 border-green-200",
  REJECTED:  "bg-red-100 text-red-800 border-red-200",
  CANCELLED: "bg-gray-100 text-gray-600 border-gray-200",
  COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
      STATUS_STYLES[status] || "bg-gray-100 text-gray-600 border-gray-200"
    }`}
  >
    {status}
  </span>
);

// ─── Format LocalDateTime array or ISO string from Spring ────────────────────
const formatDate = (dt) => {
  if (!dt) return "—";
  try {
    // Spring serialises LocalDateTime as [year,month,day,hour,min] array or ISO string
    const date = Array.isArray(dt)
      ? new Date(dt[0], dt[1] - 1, dt[2], dt[3] || 0, dt[4] || 0)
      : new Date(dt);
    return date.toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return String(dt);
  }
};

// ─── Component ────────────────────────────────────────────────────────────────
const MyBookings = () => {
  const userId = localStorage.getItem("userId");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [toast, setToast] = useState("");

  const fetchBookings = async () => {
    if (!userId) {
      setError("Not logged in.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/bookings/user/${userId}`);
      setBookings(data);
    } catch {
      setError("Failed to load bookings. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setCancellingId(id);
    try {
      await axios.patch(`/api/bookings/${id}/cancel`);
      setToast("Booking cancelled successfully.");
      fetchBookings();
    } catch (err) {
      setToast(err.response?.data?.error || "Failed to cancel booking.");
    } finally {
      setCancellingId(null);
      setTimeout(() => setToast(""), 4000);
    }
  };

  const canCancel = (status) => status === "PENDING" || status === "APPROVED";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">
            View and manage all your resource booking requests.
          </p>
        </div>

        {/* Toast */}
        {toast && (
          <div className="mb-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 px-4 py-3 text-sm">
            {toast}
          </div>
        )}

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-20 text-gray-400">Loading bookings…</div>
        )}
        {error && !loading && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-4 text-sm">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && bookings.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-5xl mb-4">📅</div>
            <p className="text-gray-500">You have no bookings yet.</p>
            <a
              href="/book-resource"
              className="mt-4 inline-block bg-[#6a0dad] text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-purple-800 transition"
            >
              Book a Resource
            </a>
          </div>
        )}

        {/* Bookings grid */}
        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
              >
                {/* Left info */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-semibold text-gray-900">
                      Resource #{b.resource?.id ?? b.resourceId ?? "—"}
                      {b.resource?.name ? ` – ${b.resource.name}` : ""}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>

                  {b.purpose && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Purpose:</span> {b.purpose}
                    </p>
                  )}

                  <p className="text-xs text-gray-400">
                    🕐 {formatDate(b.startTime)} → {formatDate(b.endTime)}
                  </p>

                  {b.expectedAttendees && (
                    <p className="text-xs text-gray-400">
                      👥 {b.expectedAttendees} attendee{b.expectedAttendees !== 1 ? "s" : ""}
                    </p>
                  )}

                  {b.status === "REJECTED" && b.rejectionReason && (
                    <p className="text-xs text-red-600 mt-1">
                      <span className="font-medium">Rejection reason:</span> {b.rejectionReason}
                    </p>
                  )}

                  <p className="text-xs text-gray-400">
                    Submitted: {formatDate(b.createdAt)}
                  </p>
                </div>

                {/* Cancel button */}
                {canCancel(b.status) && (
                  <button
                    onClick={() => handleCancel(b.id)}
                    disabled={cancellingId === b.id}
                    className="self-start sm:self-center text-sm font-semibold text-red-600 border border-red-200 rounded-xl px-4 py-2 hover:bg-red-50 transition disabled:opacity-50"
                  >
                    {cancellingId === b.id ? "Cancelling…" : "Cancel"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;

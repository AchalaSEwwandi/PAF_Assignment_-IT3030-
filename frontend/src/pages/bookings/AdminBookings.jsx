import React, { useState, useEffect } from "react";
import axios from "axios";

/**
 * AdminBookings.jsx – Module B: Booking Management (Admin View)
 *
 * Designed to be plug-and-play inside AdminDashboard's content area.
 * Matches the Admin Dashboard design language:
 *   - bg-[#6a0dad] header / accents
 *   - rounded-2xl white cards with shadow-sm
 *   - purple action buttons, status badges
 *   - Modal for rejection reason
 */

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  PENDING:   "bg-yellow-100 text-yellow-800",
  APPROVED:  "bg-green-100 text-green-800",
  REJECTED:  "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-500",
  COMPLETED: "bg-blue-100 text-blue-800",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
      STATUS_STYLES[status] || "bg-gray-100 text-gray-600"
    }`}
  >
    {status}
  </span>
);

// ─── Date formatter ───────────────────────────────────────────────────────────
const formatDate = (dt) => {
  if (!dt) return "—";
  try {
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

// ─── Rejection Modal ──────────────────────────────────────────────────────────
const RejectModal = ({ bookingId, onConfirm, onClose }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError("Please provide a rejection reason.");
      return;
    }
    onConfirm(bookingId, reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Modal header */}
        <div className="bg-[#6a0dad] px-6 py-4">
          <h2 className="text-white font-bold text-lg">Reject Booking</h2>
          <p className="text-purple-200 text-xs mt-0.5">Provide a reason that will be shown to the user.</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(""); }}
            placeholder="Enter rejection reason…"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
          {error && <p className="text-red-600 text-xs">{error}</p>}

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl px-5 py-2 transition"
            >
              Reject Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminBookings = () => {
  const [bookings, setBookings]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [toast, setToast]                 = useState({ msg: "", type: "" });
  const [rejectTarget, setRejectTarget]   = useState(null);   // bookingId being rejected
  const [actioningId, setActioningId]     = useState(null);   // id with in-flight action

  // ── Filter state ────────────────────────────────────────────────────────────
  const [filter, setFilter] = useState("PENDING");  // PENDING | ALL

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 4000);
  };

  // ── Fetch bookings ──────────────────────────────────────────────────────────
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const endpoint = filter === "PENDING" ? "/api/bookings/pending" : "/api/bookings";
      const { data } = await axios.get(endpoint);
      setBookings(data);
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  // ── Approve ─────────────────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    setActioningId(id);
    try {
      await axios.put(`/api/bookings/${id}/approve`);
      showToast("Booking approved successfully.", "success");
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to approve booking.", "error");
    } finally {
      setActioningId(null);
    }
  };

  // ── Reject (from modal) ─────────────────────────────────────────────────────
  const handleReject = async (id, reason) => {
    setRejectTarget(null);
    setActioningId(id);
    try {
      await axios.put(`/api/bookings/${id}/reject`, { reason });
      showToast("Booking rejected.", "error");
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to reject booking.", "error");
    } finally {
      setActioningId(null);
    }
  };

  // ── Stats summary ───────────────────────────────────────────────────────────
  const pendingCount  = bookings.filter((b) => b.status === "PENDING").length;
  const approvedCount = bookings.filter((b) => b.status === "APPROVED").length;
  const rejectedCount = bookings.filter((b) => b.status === "REJECTED").length;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Reject Modal */}
      {rejectTarget && (
        <RejectModal
          bookingId={rejectTarget}
          onConfirm={handleReject}
          onClose={() => setRejectTarget(null)}
        />
      )}

      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Review and action all resource booking requests.
          </p>
        </div>

        {/* Filter toggle */}
        <div className="flex gap-2">
          {["PENDING", "ALL"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filter === f
                  ? "bg-[#6a0dad] text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f === "PENDING" ? "Pending" : "All Bookings"}
            </button>
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast.msg && (
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium border ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending",  value: pendingCount,  color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Approved", value: approvedCount, color: "text-green-600",  bg: "bg-green-50"  },
          { label: "Rejected", value: rejectedCount, color: "text-red-600",    bg: "bg-red-50"    },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className={`${bg} rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm`}
          >
            <span className="text-sm font-medium text-gray-600">{label}</span>
            <span className={`text-2xl font-bold ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-20 text-gray-400">Loading bookings…</div>
      )}

      {/* Empty state */}
      {!loading && !error && bookings.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-5xl mb-4">🗂</div>
          <p className="text-gray-500">
            {filter === "PENDING" ? "No pending bookings to review." : "No bookings found."}
          </p>
        </div>
      )}

      {/* Bookings Table */}
      {!loading && !error && bookings.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["ID", "User", "Resource", "Start", "End", "Attendees", "Purpose", "Status", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-purple-50/30 transition">
                    <td className="px-4 py-3 font-mono text-gray-500 text-xs">#{b.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                      {b.user?.fullName || b.user?.username || `User #${b.user?.id ?? "?"}`}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {b.resource?.name || `Resource #${b.resource?.id ?? "?"}`}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {formatDate(b.startTime)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {formatDate(b.endTime)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-center">
                      {b.expectedAttendees ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate" title={b.purpose}>
                      {b.purpose || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                      {b.status === "REJECTED" && b.rejectionReason && (
                        <span
                          className="block text-[10px] text-red-400 mt-0.5 max-w-[120px] truncate"
                          title={b.rejectionReason}
                        >
                          {b.rejectionReason}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {b.status === "PENDING" ? (
                        <div className="flex gap-2">
                          {/* Approve */}
                          <button
                            onClick={() => handleApprove(b.id)}
                            disabled={actioningId === b.id}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#6a0dad] hover:bg-purple-800 rounded-lg transition disabled:opacity-50"
                          >
                            {actioningId === b.id ? "…" : "Approve"}
                          </button>
                          {/* Reject */}
                          <button
                            onClick={() => setRejectTarget(b.id)}
                            disabled={actioningId === b.id}
                            className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;

import React, { useState } from "react";
import axios from "axios";

/**
 * BookResource.jsx – Module B: Booking Management
 * Allows a user to submit a new resource booking request.
 * Uses userId from localStorage (set at login); resourceId is entered manually
 * or can be replaced with a dropdown when the Resources API is integrated.
 */
const BookResource = () => {
  const userId = localStorage.getItem("userId") || "";

  const [form, setForm] = useState({
    resourceId: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!userId) {
      setError("You must be logged in to make a booking.");
      return;
    }

    // Basic client-side validation
    if (!form.resourceId || !form.startTime || !form.endTime) {
      setError("Resource ID, Start Time, and End Time are required.");
      return;
    }
    if (new Date(form.endTime) <= new Date(form.startTime)) {
      setError("End time must be after start time.");
      return;
    }

    const payload = {
      userId: Number(userId),
      resourceId: Number(form.resourceId),
      startTime: form.startTime,   // ISO string → Spring parses as LocalDateTime
      endTime: form.endTime,
      purpose: form.purpose,
      expectedAttendees: form.expectedAttendees ? Number(form.expectedAttendees) : null,
    };

    try {
      setLoading(true);
      await axios.post("/api/bookings", payload);
      setSuccess("Booking request submitted successfully! It is now pending admin approval.");
      setForm({ resourceId: "", startTime: "", endTime: "", purpose: "", expectedAttendees: "" });
    } catch (err) {
      const msg = err.response?.data?.error;
      if (err.response?.status === 409) {
        setError("⚠ Time Conflict: " + (msg || "This resource is already booked for the selected window."));
      } else if (err.response?.status === 404) {
        setError("Not Found: " + (msg || "User or Resource does not exist."));
      } else {
        setError(msg || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#6a0dad] px-8 py-6">
          <h1 className="text-2xl font-bold text-white">Book a Resource</h1>
          <p className="text-purple-200 text-sm mt-1">
            Submit a booking request for a campus room, lab, or equipment.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">

          {/* Success Banner */}
          {success && (
            <div className="rounded-xl bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">
              ✅ {success}
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Resource ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Resource ID <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="resourceId"
              value={form.resourceId}
              onChange={handleChange}
              placeholder="e.g. 3"
              min="1"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              End Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Purpose</label>
            <textarea
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              rows={3}
              placeholder="Briefly describe why you need this resource…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
            />
          </div>

          {/* Expected Attendees */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Expected Attendees
            </label>
            <input
              type="number"
              name="expectedAttendees"
              value={form.expectedAttendees}
              onChange={handleChange}
              placeholder="e.g. 20"
              min="1"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6a0dad] hover:bg-purple-800 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting…" : "Submit Booking Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookResource;

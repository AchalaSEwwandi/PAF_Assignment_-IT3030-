import React, { useState } from "react";
import axios from "axios";

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
      startTime: form.startTime,
      endTime: form.endTime,
      purpose: form.purpose,
      expectedAttendees: form.expectedAttendees ? Number(form.expectedAttendees) : null,
    };

    try {
      setLoading(true);
      await axios.post("/api/bookings", payload);
      setSuccess("Booking submitted successfully!");
      setForm({ resourceId: "", startTime: "", endTime: "", purpose: "", expectedAttendees: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 flex items-center justify-center px-4 py-10">
      
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

        {/* 🔥 Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
          <h1 className="text-2xl font-bold text-white">📅 Book a Resource</h1>
          <p className="text-purple-100 text-sm mt-1">
            Reserve rooms, labs, or equipment easily.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">

          {/* Alerts */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
              ✅ {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              ⚠ {error}
            </div>
          )}

          {/* Resource ID */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Resource ID *
            </label>
            <input
              type="number"
              name="resourceId"
              value={form.resourceId}
              onChange={handleChange}
              placeholder="Enter resource ID"
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          {/* Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Start Time *</label>
              <input
                type="datetime-local"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">End Time *</label>
              <input
                type="datetime-local"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Purpose</label>
            <textarea
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              rows={3}
              placeholder="Why do you need this resource?"
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          {/* Attendees */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Expected Attendees
            </label>
            <input
              type="number"
              name="expectedAttendees"
              value={form.expectedAttendees}
              onChange={handleChange}
              placeholder="e.g. 20"
              className="mt-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-semibold py-3 rounded-xl transition"
          >
            {loading ? "Submitting..." : "Submit Booking"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookResource;
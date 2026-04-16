import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import BookResource from "./pages/bookings/BookResource";
import MyBookings from "./pages/bookings/MyBookings";
import AdminBookings from "./pages/bookings/AdminBookings";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 👉 default route */}
        <Route path="/" element={<BookResource />} />

        <Route path="/book-resource" element={<BookResource />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
      </Routes>
    </Router>
  );
  
}
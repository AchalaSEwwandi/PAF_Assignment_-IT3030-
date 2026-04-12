package com.smartcampus.controller;

import com.smartcampus.dto.BookingRequest;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Resource;
import com.smartcampus.model.User;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST controller for Module B – Booking Management.
 *
 * Endpoints:
 *   POST   /api/bookings                   → Create a new booking (with conflict check)
 *   GET    /api/bookings/user/{userId}     → Get all bookings for a specific user
 *   GET    /api/bookings/pending           → Get all PENDING bookings (admin view)
 *   PUT    /api/bookings/{id}/approve      → Approve a PENDING booking
 *   PUT    /api/bookings/{id}/reject       → Reject a PENDING booking with a reason
 *   PATCH  /api/bookings/{id}/cancel       → Cancel a PENDING or APPROVED booking
 */
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingRepository  bookingRepository;
    private final UserRepository     userRepository;
    private final ResourceRepository resourceRepository;

    public BookingController(
            BookingRepository  bookingRepository,
            UserRepository     userRepository,
            ResourceRepository resourceRepository
    ) {
        this.bookingRepository  = bookingRepository;
        this.userRepository     = userRepository;
        this.resourceRepository = resourceRepository;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/bookings
    // Creates a new booking with status PENDING.
    // Returns 409 CONFLICT if the resource is already booked in the given window.
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {

        // Validate time window
        if (request.getStartTime() == null || request.getEndTime() == null
                || !request.getEndTime().isAfter(request.getStartTime())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid time window: endTime must be after startTime."));
        }

        // Resolve user
        Optional<User> userOpt = userRepository.findById(request.getUserId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found with id: " + request.getUserId()));
        }

        // Resolve resource
        Optional<Resource> resourceOpt = resourceRepository.findById(request.getResourceId());
        if (resourceOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Resource not found with id: " + request.getResourceId()));
        }

        // Check for overlapping PENDING / APPROVED bookings on the same resource
        boolean conflict = bookingRepository.existsConflict(
                request.getResourceId(),
                request.getStartTime(),
                request.getEndTime()
        );
        if (conflict) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error",
                            "This resource is already booked for the requested time window. " +
                            "Please choose a different time slot."));
        }

        // Build and persist the booking
        Booking booking = new Booking();
        booking.setUser(userOpt.get());
        booking.setResource(resourceOpt.get());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(Booking.Status.PENDING);

        Booking saved = bookingRepository.save(booking);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/bookings/user/{userId}
    // Returns all bookings for the given user, newest first.
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getBookingsByUser(@PathVariable Long userId) {
        List<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(bookings);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/bookings/pending
    // Returns all bookings with status PENDING for admin review, oldest first.
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/pending")
    public ResponseEntity<List<Booking>> getPendingBookings() {
        List<Booking> pending = bookingRepository
                .findByStatusOrderByCreatedAtAsc(Booking.Status.PENDING);
        return ResponseEntity.ok(pending);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /api/bookings/{id}/approve
    // Transitions a PENDING booking to APPROVED.
    // ─────────────────────────────────────────────────────────────────────────
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveBooking(@PathVariable Long id) {
        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Booking not found with id: " + id));
        }

        Booking booking = bookingOpt.get();
        if (booking.getStatus() != Booking.Status.PENDING) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error",
                            "Only PENDING bookings can be approved. Current status: " + booking.getStatus()));
        }

        booking.setStatus(Booking.Status.APPROVED);
        bookingRepository.save(booking);
        return ResponseEntity.ok(Map.of("message", "Booking approved successfully.", "id", id));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /api/bookings/{id}/reject
    // Transitions a PENDING booking to REJECTED with a mandatory reason.
    // Request body: { "reason": "<text>" }
    // ─────────────────────────────────────────────────────────────────────────
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String reason = body.get("reason");
        if (reason == null || reason.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "A rejection reason is required."));
        }

        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Booking not found with id: " + id));
        }

        Booking booking = bookingOpt.get();
        if (booking.getStatus() != Booking.Status.PENDING) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error",
                            "Only PENDING bookings can be rejected. Current status: " + booking.getStatus()));
        }

        booking.setStatus(Booking.Status.REJECTED);
        booking.setRejectionReason(reason);
        bookingRepository.save(booking);
        return ResponseEntity.ok(Map.of("message", "Booking rejected.", "id", id));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PATCH /api/bookings/{id}/cancel
    // Allows a user to cancel their own PENDING or APPROVED booking.
    // ─────────────────────────────────────────────────────────────────────────
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Booking not found with id: " + id));
        }

        Booking booking = bookingOpt.get();
        if (booking.getStatus() == Booking.Status.CANCELLED) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Booking is already cancelled."));
        }
        if (booking.getStatus() == Booking.Status.REJECTED
                || booking.getStatus() == Booking.Status.COMPLETED) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error",
                            "Cannot cancel a booking with status: " + booking.getStatus()));
        }

        booking.setStatus(Booking.Status.CANCELLED);
        bookingRepository.save(booking);
        return ResponseEntity.ok(Map.of("message", "Booking cancelled successfully.", "id", id));
    }
}

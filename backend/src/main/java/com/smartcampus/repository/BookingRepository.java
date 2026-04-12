package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for Booking entity with custom conflict-detection queries.
 */
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Fetch all bookings belonging to a specific user, newest first.
     */
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Fetch all bookings that are PENDING, for admin review.
     */
    List<Booking> findByStatusOrderByCreatedAtAsc(Booking.Status status);

    /**
     * Conflict detection: returns true if the given resource already has an
     * APPROVED or PENDING booking whose time window overlaps [startTime, endTime].
     *
     * Overlap condition: existing.startTime < newEndTime AND existing.endTime > newStartTime
     */
    @Query("""
            SELECT COUNT(b) > 0
            FROM Booking b
            WHERE b.resource.id = :resourceId
              AND b.status IN (com.smartcampus.model.Booking.Status.APPROVED,
                               com.smartcampus.model.Booking.Status.PENDING)
              AND b.startTime < :endTime
              AND b.endTime   > :startTime
            """)
    boolean existsConflict(
            @Param("resourceId") Long resourceId,
            @Param("startTime")  LocalDateTime startTime,
            @Param("endTime")    LocalDateTime endTime
    );
}

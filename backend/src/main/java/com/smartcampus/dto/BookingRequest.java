package com.smartcampus.dto;

import java.time.LocalDateTime;

/**
 * DTO for creating a new booking request.
 * Carries only the data needed from the client; entity resolution happens in the controller.
 */
public class BookingRequest {

    /** ID of the user making the booking */
    private Long userId;

    /** ID of the resource (room, lab, equipment) to be booked */
    private Long resourceId;

    /** Booking start date/time (ISO-8601: "yyyy-MM-dd'T'HH:mm:ss") */
    private LocalDateTime startTime;

    /** Booking end date/time */
    private LocalDateTime endTime;

    /** Brief description of why the resource is needed */
    private String purpose;

    /** Number of people expected to use the resource */
    private Integer expectedAttendees;

    // ─── Getters & Setters ────────────────────────────────────────────────────

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public Integer getExpectedAttendees() {
        return expectedAttendees;
    }

    public void setExpectedAttendees(Integer expectedAttendees) {
        this.expectedAttendees = expectedAttendees;
    }
}

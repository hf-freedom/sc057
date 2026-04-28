package com.gym.entity;

import java.time.LocalDateTime;

public class Booking {
    private Long id;
    private Long userId;
    private Long classId;
    private String status;
    private Integer lessonsDeducted;
    private LocalDateTime bookedAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime checkedInAt;
    private String cancelReason;
    
    public static final String STATUS_BOOKED = "BOOKED";
    public static final String STATUS_WAITLIST = "WAITLIST";
    public static final String STATUS_CANCELLED = "CANCELLED";
    public static final String STATUS_CHECKED_IN = "CHECKED_IN";
    public static final String STATUS_NO_SHOW = "NO_SHOW";
    public static final String STATUS_COMPLETED = "COMPLETED";
    
    public Booking() {
        this.status = STATUS_BOOKED;
        this.bookedAt = LocalDateTime.now();
        this.lessonsDeducted = 0;
    }
    
    public Booking(Long id, Long userId, Long classId) {
        this.id = id;
        this.userId = userId;
        this.classId = classId;
        this.status = STATUS_BOOKED;
        this.bookedAt = LocalDateTime.now();
        this.lessonsDeducted = 0;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Long getClassId() {
        return classId;
    }
    
    public void setClassId(Long classId) {
        this.classId = classId;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Integer getLessonsDeducted() {
        return lessonsDeducted;
    }
    
    public void setLessonsDeducted(Integer lessonsDeducted) {
        this.lessonsDeducted = lessonsDeducted;
    }
    
    public LocalDateTime getBookedAt() {
        return bookedAt;
    }
    
    public void setBookedAt(LocalDateTime bookedAt) {
        this.bookedAt = bookedAt;
    }
    
    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }
    
    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }
    
    public LocalDateTime getCheckedInAt() {
        return checkedInAt;
    }
    
    public void setCheckedInAt(LocalDateTime checkedInAt) {
        this.checkedInAt = checkedInAt;
    }
    
    public String getCancelReason() {
        return cancelReason;
    }
    
    public void setCancelReason(String cancelReason) {
        this.cancelReason = cancelReason;
    }
    
    public boolean isActive() {
        return STATUS_BOOKED.equals(status) || STATUS_WAITLIST.equals(status);
    }
    
    public boolean isWaitlist() {
        return STATUS_WAITLIST.equals(status);
    }
    
    public void markAsCancelled(String reason) {
        this.status = STATUS_CANCELLED;
        this.cancelledAt = LocalDateTime.now();
        this.cancelReason = reason;
    }
    
    public void markAsCheckedIn() {
        this.status = STATUS_CHECKED_IN;
        this.checkedInAt = LocalDateTime.now();
    }
    
    public void markAsNoShow() {
        this.status = STATUS_NO_SHOW;
    }
    
    public void markAsCompleted() {
        this.status = STATUS_COMPLETED;
    }
}

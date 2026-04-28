package com.gym.entity;

import java.time.LocalDateTime;

public class NoShowRecord {
    private Long id;
    private Long userId;
    private Long classId;
    private Long bookingId;
    private LocalDateTime recordedAt;
    private Integer lessonsDeducted;
    private String reason;
    
    public NoShowRecord() {
        this.recordedAt = LocalDateTime.now();
    }
    
    public NoShowRecord(Long id, Long userId, Long classId, Long bookingId, 
                        Integer lessonsDeducted, String reason) {
        this.id = id;
        this.userId = userId;
        this.classId = classId;
        this.bookingId = bookingId;
        this.recordedAt = LocalDateTime.now();
        this.lessonsDeducted = lessonsDeducted;
        this.reason = reason;
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
    
    public Long getBookingId() {
        return bookingId;
    }
    
    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }
    
    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }
    
    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }
    
    public Integer getLessonsDeducted() {
        return lessonsDeducted;
    }
    
    public void setLessonsDeducted(Integer lessonsDeducted) {
        this.lessonsDeducted = lessonsDeducted;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
}

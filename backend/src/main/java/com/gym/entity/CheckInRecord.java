package com.gym.entity;

import java.time.LocalDateTime;

public class CheckInRecord {
    private Long id;
    private Long bookingId;
    private Long userId;
    private Long classId;
    private LocalDateTime checkInTime;
    private String checkInMethod;
    private Integer lessonsDeducted;
    
    public static final String METHOD_MANUAL = "MANUAL";
    public static final String METHOD_QR = "QR_CODE";
    public static final String METHOD_AUTO = "AUTO";
    
    public CheckInRecord() {
        this.checkInTime = LocalDateTime.now();
    }
    
    public CheckInRecord(Long id, Long bookingId, Long userId, Long classId, 
                         String checkInMethod, Integer lessonsDeducted) {
        this.id = id;
        this.bookingId = bookingId;
        this.userId = userId;
        this.classId = classId;
        this.checkInTime = LocalDateTime.now();
        this.checkInMethod = checkInMethod;
        this.lessonsDeducted = lessonsDeducted;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getBookingId() {
        return bookingId;
    }
    
    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
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
    
    public LocalDateTime getCheckInTime() {
        return checkInTime;
    }
    
    public void setCheckInTime(LocalDateTime checkInTime) {
        this.checkInTime = checkInTime;
    }
    
    public String getCheckInMethod() {
        return checkInMethod;
    }
    
    public void setCheckInMethod(String checkInMethod) {
        this.checkInMethod = checkInMethod;
    }
    
    public Integer getLessonsDeducted() {
        return lessonsDeducted;
    }
    
    public void setLessonsDeducted(Integer lessonsDeducted) {
        this.lessonsDeducted = lessonsDeducted;
    }
}

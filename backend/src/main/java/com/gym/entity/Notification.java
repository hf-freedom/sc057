package com.gym.entity;

import java.time.LocalDateTime;

public class Notification {
    private Long id;
    private Long userId;
    private String type;
    private String title;
    private String content;
    private Boolean read;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    
    public static final String TYPE_BOOKING_SUCCESS = "BOOKING_SUCCESS";
    public static final String TYPE_BOOKING_WAITLIST = "BOOKING_WAITLIST";
    public static final String TYPE_WAITLIST_PROMOTED = "WAITLIST_PROMOTED";
    public static final String TYPE_CANCEL_SUCCESS = "CANCEL_SUCCESS";
    public static final String TYPE_CLASS_CANCELLED = "CLASS_CANCELLED";
    public static final String TYPE_NO_SHOW = "NO_SHOW";
    public static final String TYPE_CHECKIN_SUCCESS = "CHECKIN_SUCCESS";
    public static final String TYPE_SETTLEMENT_GENERATED = "SETTLEMENT_GENERATED";
    
    public Notification() {
        this.read = false;
        this.createdAt = LocalDateTime.now();
    }
    
    public Notification(Long id, Long userId, String type, String title, String content) {
        this.id = id;
        this.userId = userId;
        this.type = type;
        this.title = title;
        this.content = content;
        this.read = false;
        this.createdAt = LocalDateTime.now();
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
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public Boolean getRead() {
        return read;
    }
    
    public void setRead(Boolean read) {
        this.read = read;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getReadAt() {
        return readAt;
    }
    
    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }
    
    public void markAsRead() {
        this.read = true;
        this.readAt = LocalDateTime.now();
    }
}

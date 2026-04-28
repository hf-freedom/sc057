package com.gym.entity;

import java.time.LocalDateTime;

public class WaitlistEntry {
    private Long id;
    private Long userId;
    private Long classId;
    private Integer position;
    private LocalDateTime createdAt;
    private Boolean promoted;
    private LocalDateTime promotedAt;
    
    public WaitlistEntry() {
        this.createdAt = LocalDateTime.now();
        this.promoted = false;
    }
    
    public WaitlistEntry(Long id, Long userId, Long classId, Integer position) {
        this.id = id;
        this.userId = userId;
        this.classId = classId;
        this.position = position;
        this.createdAt = LocalDateTime.now();
        this.promoted = false;
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
    
    public Integer getPosition() {
        return position;
    }
    
    public void setPosition(Integer position) {
        this.position = position;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public Boolean getPromoted() {
        return promoted;
    }
    
    public void setPromoted(Boolean promoted) {
        this.promoted = promoted;
    }
    
    public LocalDateTime getPromotedAt() {
        return promotedAt;
    }
    
    public void setPromotedAt(LocalDateTime promotedAt) {
        this.promotedAt = promotedAt;
    }
    
    public void promote() {
        this.promoted = true;
        this.promotedAt = LocalDateTime.now();
    }
}

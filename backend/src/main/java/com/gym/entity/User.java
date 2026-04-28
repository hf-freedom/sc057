package com.gym.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class User {
    private Long id;
    private String name;
    private String phone;
    private Integer lessonBalance;
    private Integer creditScore;
    private Boolean blacklisted;
    private Integer noShowCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public User() {
        this.creditScore = 100;
        this.blacklisted = false;
        this.noShowCount = 0;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public User(Long id, String name, String phone, Integer lessonBalance) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.lessonBalance = lessonBalance;
        this.creditScore = 100;
        this.blacklisted = false;
        this.noShowCount = 0;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public Integer getLessonBalance() {
        return lessonBalance;
    }
    
    public void setLessonBalance(Integer lessonBalance) {
        this.lessonBalance = lessonBalance;
        this.updatedAt = LocalDateTime.now();
    }
    
    public Integer getCreditScore() {
        return creditScore;
    }
    
    public void setCreditScore(Integer creditScore) {
        this.creditScore = creditScore;
        this.updatedAt = LocalDateTime.now();
    }
    
    public Boolean getBlacklisted() {
        return blacklisted;
    }
    
    public void setBlacklisted(Boolean blacklisted) {
        this.blacklisted = blacklisted;
        this.updatedAt = LocalDateTime.now();
    }
    
    public Integer getNoShowCount() {
        return noShowCount;
    }
    
    public void setNoShowCount(Integer noShowCount) {
        this.noShowCount = noShowCount;
        this.updatedAt = LocalDateTime.now();
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public boolean isCanBook() {
        if (blacklisted) {
            return false;
        }
        if (noShowCount >= 3) {
            return false;
        }
        return creditScore >= 60;
    }
    
    public boolean canBook() {
        return isCanBook();
    }
    
    public void incrementNoShow() {
        this.noShowCount++;
        this.creditScore = Math.max(0, this.creditScore - 10);
        if (this.noShowCount >= 3) {
            this.blacklisted = true;
        }
        this.updatedAt = LocalDateTime.now();
    }
    
    public void deductLessons(int count) {
        if (this.lessonBalance >= count) {
            this.lessonBalance -= count;
            this.updatedAt = LocalDateTime.now();
        }
    }
    
    public void addLessons(int count) {
        this.lessonBalance += count;
        this.updatedAt = LocalDateTime.now();
    }
}

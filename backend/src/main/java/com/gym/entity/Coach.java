package com.gym.entity;

import java.time.LocalDateTime;

public class Coach {
    private Long id;
    private String name;
    private String phone;
    private String specialty;
    private Boolean onLeave;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public Coach() {
        this.onLeave = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public Coach(Long id, String name, String phone, String specialty) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.specialty = specialty;
        this.onLeave = false;
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
    
    public String getSpecialty() {
        return specialty;
    }
    
    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }
    
    public Boolean getOnLeave() {
        return onLeave;
    }
    
    public void setOnLeave(Boolean onLeave) {
        this.onLeave = onLeave;
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
}

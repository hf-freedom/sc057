package com.gym.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;

public class Settlement {
    private Long id;
    private Long coachId;
    private YearMonth settlementMonth;
    private Integer totalClasses;
    private Integer totalStudents;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private String remark;
    
    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_PAID = "PAID";
    public static final String STATUS_CANCELLED = "CANCELLED";
    
    public Settlement() {
        this.status = STATUS_PENDING;
        this.createdAt = LocalDateTime.now();
        this.totalAmount = BigDecimal.ZERO;
    }
    
    public Settlement(Long id, Long coachId, YearMonth settlementMonth, 
                      Integer totalClasses, Integer totalStudents, BigDecimal totalAmount) {
        this.id = id;
        this.coachId = coachId;
        this.settlementMonth = settlementMonth;
        this.totalClasses = totalClasses;
        this.totalStudents = totalStudents;
        this.totalAmount = totalAmount;
        this.status = STATUS_PENDING;
        this.createdAt = LocalDateTime.now();
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getCoachId() {
        return coachId;
    }
    
    public void setCoachId(Long coachId) {
        this.coachId = coachId;
    }
    
    public YearMonth getSettlementMonth() {
        return settlementMonth;
    }
    
    public void setSettlementMonth(YearMonth settlementMonth) {
        this.settlementMonth = settlementMonth;
    }
    
    public Integer getTotalClasses() {
        return totalClasses;
    }
    
    public void setTotalClasses(Integer totalClasses) {
        this.totalClasses = totalClasses;
    }
    
    public Integer getTotalStudents() {
        return totalStudents;
    }
    
    public void setTotalStudents(Integer totalStudents) {
        this.totalStudents = totalStudents;
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getPaidAt() {
        return paidAt;
    }
    
    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }
    
    public String getRemark() {
        return remark;
    }
    
    public void setRemark(String remark) {
        this.remark = remark;
    }
    
    public void markAsPaid() {
        this.status = STATUS_PAID;
        this.paidAt = LocalDateTime.now();
    }
}

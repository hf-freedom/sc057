package com.gym.store;

import com.gym.entity.*;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class DataStore {
    
    private final Map<Long, User> users = new ConcurrentHashMap<>();
    private final AtomicLong userIdCounter = new AtomicLong(1);
    
    private final Map<Long, Coach> coaches = new ConcurrentHashMap<>();
    private final AtomicLong coachIdCounter = new AtomicLong(1);
    
    private final Map<Long, GymClass> gymClasses = new ConcurrentHashMap<>();
    private final AtomicLong classIdCounter = new AtomicLong(1);
    
    private final Map<Long, Booking> bookings = new ConcurrentHashMap<>();
    private final AtomicLong bookingIdCounter = new AtomicLong(1);
    
    private final Map<Long, WaitlistEntry> waitlistEntries = new ConcurrentHashMap<>();
    private final AtomicLong waitlistIdCounter = new AtomicLong(1);
    
    private final Map<Long, CheckInRecord> checkInRecords = new ConcurrentHashMap<>();
    private final AtomicLong checkInIdCounter = new AtomicLong(1);
    
    private final Map<Long, NoShowRecord> noShowRecords = new ConcurrentHashMap<>();
    private final AtomicLong noShowIdCounter = new AtomicLong(1);
    
    private final Map<Long, Settlement> settlements = new ConcurrentHashMap<>();
    private final AtomicLong settlementIdCounter = new AtomicLong(1);
    
    private final Map<Long, Notification> notifications = new ConcurrentHashMap<>();
    private final AtomicLong notificationIdCounter = new AtomicLong(1);
    
    public Long nextUserId() {
        return userIdCounter.getAndIncrement();
    }
    
    public Long nextCoachId() {
        return coachIdCounter.getAndIncrement();
    }
    
    public Long nextClassId() {
        return classIdCounter.getAndIncrement();
    }
    
    public Long nextBookingId() {
        return bookingIdCounter.getAndIncrement();
    }
    
    public Long nextWaitlistId() {
        return waitlistIdCounter.getAndIncrement();
    }
    
    public Long nextCheckInId() {
        return checkInIdCounter.getAndIncrement();
    }
    
    public Long nextNoShowId() {
        return noShowIdCounter.getAndIncrement();
    }
    
    public Long nextSettlementId() {
        return settlementIdCounter.getAndIncrement();
    }
    
    public Long nextNotificationId() {
        return notificationIdCounter.getAndIncrement();
    }
    
    public void saveUser(User user) {
        if (user.getId() == null) {
            user.setId(nextUserId());
        }
        users.put(user.getId(), user);
    }
    
    public User getUser(Long id) {
        return users.get(id);
    }
    
    public List<User> getAllUsers() {
        return new ArrayList<>(users.values());
    }
    
    public void saveCoach(Coach coach) {
        if (coach.getId() == null) {
            coach.setId(nextCoachId());
        }
        coaches.put(coach.getId(), coach);
    }
    
    public Coach getCoach(Long id) {
        return coaches.get(id);
    }
    
    public List<Coach> getAllCoaches() {
        return new ArrayList<>(coaches.values());
    }
    
    public void saveClass(GymClass gymClass) {
        if (gymClass.getId() == null) {
            gymClass.setId(nextClassId());
        }
        gymClasses.put(gymClass.getId(), gymClass);
    }
    
    public GymClass getClass(Long id) {
        return gymClasses.get(id);
    }
    
    public List<GymClass> getAllClasses() {
        return new ArrayList<>(gymClasses.values());
    }
    
    public void saveBooking(Booking booking) {
        if (booking.getId() == null) {
            booking.setId(nextBookingId());
        }
        bookings.put(booking.getId(), booking);
    }
    
    public Booking getBooking(Long id) {
        return bookings.get(id);
    }
    
    public List<Booking> getAllBookings() {
        return new ArrayList<>(bookings.values());
    }
    
    public List<Booking> getBookingsByClassId(Long classId) {
        List<Booking> result = new ArrayList<>();
        for (Booking booking : bookings.values()) {
            if (classId.equals(booking.getClassId())) {
                result.add(booking);
            }
        }
        return result;
    }
    
    public List<Booking> getBookingsByUserId(Long userId) {
        List<Booking> result = new ArrayList<>();
        for (Booking booking : bookings.values()) {
            if (userId.equals(booking.getUserId())) {
                result.add(booking);
            }
        }
        return result;
    }
    
    public void saveWaitlistEntry(WaitlistEntry entry) {
        if (entry.getId() == null) {
            entry.setId(nextWaitlistId());
        }
        waitlistEntries.put(entry.getId(), entry);
    }
    
    public WaitlistEntry getWaitlistEntry(Long id) {
        return waitlistEntries.get(id);
    }
    
    public List<WaitlistEntry> getAllWaitlistEntries() {
        return new ArrayList<>(waitlistEntries.values());
    }
    
    public List<WaitlistEntry> getWaitlistByClassId(Long classId) {
        List<WaitlistEntry> result = new ArrayList<>();
        for (WaitlistEntry entry : waitlistEntries.values()) {
            if (classId.equals(entry.getClassId()) && !entry.getPromoted()) {
                result.add(entry);
            }
        }
        result.sort(Comparator.comparing(WaitlistEntry::getPosition));
        return result;
    }
    
    public void saveCheckInRecord(CheckInRecord record) {
        if (record.getId() == null) {
            record.setId(nextCheckInId());
        }
        checkInRecords.put(record.getId(), record);
    }
    
    public CheckInRecord getCheckInRecord(Long id) {
        return checkInRecords.get(id);
    }
    
    public List<CheckInRecord> getAllCheckInRecords() {
        return new ArrayList<>(checkInRecords.values());
    }
    
    public void saveNoShowRecord(NoShowRecord record) {
        if (record.getId() == null) {
            record.setId(nextNoShowId());
        }
        noShowRecords.put(record.getId(), record);
    }
    
    public NoShowRecord getNoShowRecord(Long id) {
        return noShowRecords.get(id);
    }
    
    public List<NoShowRecord> getAllNoShowRecords() {
        return new ArrayList<>(noShowRecords.values());
    }
    
    public void saveSettlement(Settlement settlement) {
        if (settlement.getId() == null) {
            settlement.setId(nextSettlementId());
        }
        settlements.put(settlement.getId(), settlement);
    }
    
    public Settlement getSettlement(Long id) {
        return settlements.get(id);
    }
    
    public List<Settlement> getAllSettlements() {
        return new ArrayList<>(settlements.values());
    }
    
    public void saveNotification(Notification notification) {
        if (notification.getId() == null) {
            notification.setId(nextNotificationId());
        }
        notifications.put(notification.getId(), notification);
    }
    
    public Notification getNotification(Long id) {
        return notifications.get(id);
    }
    
    public List<Notification> getAllNotifications() {
        return new ArrayList<>(notifications.values());
    }
    
    public List<Notification> getNotificationsByUserId(Long userId) {
        List<Notification> result = new ArrayList<>();
        for (Notification notification : notifications.values()) {
            if (userId.equals(notification.getUserId())) {
                result.add(notification);
            }
        }
        result.sort(Comparator.comparing(Notification::getCreatedAt).reversed());
        return result;
    }
}

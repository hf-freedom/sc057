package com.gym.service;

import com.gym.entity.*;
import com.gym.store.DataStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoShowService {
    
    @Autowired
    private DataStore dataStore;
    
    @Autowired
    private NotificationService notificationService;
    
    @Scheduled(fixedRate = 60000)
    public void checkNoShows() {
        LocalDateTime now = LocalDateTime.now();
        
        List<GymClass> allClasses = dataStore.getAllClasses();
        for (GymClass gymClass : allClasses) {
            if (!GymClass.STATUS_SCHEDULED.equals(gymClass.getStatus()) && 
                !GymClass.STATUS_IN_PROGRESS.equals(gymClass.getStatus())) {
                continue;
            }
            
            if (now.isBefore(gymClass.getStartTime().plusMinutes(15))) {
                continue;
            }
            
            if (now.isAfter(gymClass.getEndTime().plusMinutes(30))) {
                continue;
            }
            
            List<Booking> bookings = dataStore.getBookingsByClassId(gymClass.getId());
            for (Booking booking : bookings) {
                if (!Booking.STATUS_BOOKED.equals(booking.getStatus())) {
                    continue;
                }
                
                if (isAlreadyCheckedIn(booking.getId())) {
                    continue;
                }
                
                processNoShow(booking, gymClass);
            }
            
            if (now.isAfter(gymClass.getEndTime())) {
                gymClass.setStatus(GymClass.STATUS_COMPLETED);
                dataStore.saveClass(gymClass);
            }
        }
    }
    
    private boolean isAlreadyCheckedIn(Long bookingId) {
        List<CheckInRecord> allRecords = dataStore.getAllCheckInRecords();
        return allRecords.stream()
                .anyMatch(r -> bookingId.equals(r.getBookingId()));
    }
    
    private void processNoShow(Booking booking, GymClass gymClass) {
        User user = dataStore.getUser(booking.getUserId());
        if (user == null) {
            return;
        }
        
        int requiredLessons = gymClass.getRequiredLessons();
        if (user.getLessonBalance() >= requiredLessons) {
            user.deductLessons(requiredLessons);
        } else if (user.getLessonBalance() > 0) {
            user.deductLessons(user.getLessonBalance());
        }
        
        user.incrementNoShow();
        dataStore.saveUser(user);
        
        booking.markAsNoShow();
        booking.setLessonsDeducted(requiredLessons);
        dataStore.saveBooking(booking);
        
        NoShowRecord record = new NoShowRecord();
        record.setUserId(booking.getUserId());
        record.setClassId(booking.getClassId());
        record.setBookingId(booking.getId());
        record.setLessonsDeducted(requiredLessons);
        record.setReason("课程开始后未签到");
        dataStore.saveNoShowRecord(record);
        
        String blacklistMsg = "";
        if (user.getBlacklisted()) {
            blacklistMsg = "由于您爽约次数已达3次，您已被加入黑名单，暂时无法预约课程。";
        } else if (user.getNoShowCount() >= 2) {
            blacklistMsg = "请注意：您的爽约次数已达" + user.getNoShowCount() + "次，再爽约1次将被加入黑名单。";
        }
        
        notificationService.createNotification(
                booking.getUserId(),
                Notification.TYPE_NO_SHOW,
                "爽约提醒",
                "您未按时参加【" + gymClass.getName() + "】，已被标记为爽约。" +
                "已扣除" + requiredLessons + "课时，信用分-10。" + blacklistMsg
        );
    }
    
    public List<NoShowRecord> getUserNoShowRecords(Long userId) {
        List<NoShowRecord> allRecords = dataStore.getAllNoShowRecords();
        return allRecords.stream()
                .filter(r -> userId.equals(r.getUserId()))
                .collect(Collectors.toList());
    }
    
    public List<NoShowRecord> getAllNoShowRecords() {
        return dataStore.getAllNoShowRecords();
    }
}

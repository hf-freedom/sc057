package com.gym.service;

import com.gym.entity.*;
import com.gym.store.DataStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CoachService {
    
    @Autowired
    private DataStore dataStore;
    
    @Autowired
    private NotificationService notificationService;
    
    public Object coachOnLeave(Long coachId, LocalDateTime leaveStart, LocalDateTime leaveEnd) {
        Coach coach = dataStore.getCoach(coachId);
        if (coach == null) {
            return new Result(false, "教练不存在");
        }
        
        List<GymClass> coachClasses = dataStore.getAllClasses().stream()
                .filter(c -> coachId.equals(c.getCoachId()))
                .filter(c -> GymClass.STATUS_SCHEDULED.equals(c.getStatus()))
                .filter(c -> {
                    LocalDateTime classTime = c.getStartTime();
                    return (classTime.isAfter(leaveStart) || classTime.isEqual(leaveStart)) &&
                           (classTime.isBefore(leaveEnd) || classTime.isEqual(leaveEnd));
                })
                .collect(Collectors.toList());
        
        if (coachClasses.isEmpty()) {
            coach.setOnLeave(true);
            dataStore.saveCoach(coach);
            return new Result(true, "教练已标记为请假，期间无课程需要处理");
        }
        
        StringBuilder message = new StringBuilder();
        message.append("教练请假期间有").append(coachClasses.size()).append("节课程需要处理：\n");
        
        for (GymClass gymClass : coachClasses) {
            List<Coach> availableCoaches = dataStore.getAllCoaches().stream()
                    .filter(c -> !coachId.equals(c.getId()))
                    .filter(c -> !c.getOnLeave())
                    .collect(Collectors.toList());
            
            if (!availableCoaches.isEmpty()) {
                Coach newCoach = availableCoaches.get(0);
                gymClass.setCoachId(newCoach.getId());
                dataStore.saveClass(gymClass);
                
                message.append("- 【").append(gymClass.getName())
                       .append("】已更换教练为：").append(newCoach.getName()).append("\n");
                
                List<Booking> bookings = dataStore.getBookingsByClassId(gymClass.getId()).stream()
                        .filter(Booking::isActive)
                        .collect(Collectors.toList());
                
                for (Booking booking : bookings) {
                    notificationService.createNotification(
                            booking.getUserId(),
                            Notification.TYPE_CLASS_CANCELLED,
                            "课程教练变更",
                            "您预约的【" + gymClass.getName() + "】因原教练请假，已更换教练为：" + newCoach.getName()
                    );
                }
            } else {
                cancelClass(gymClass, "教练请假，无可用替代教练");
                message.append("- 【").append(gymClass.getName())
                       .append("】已取消（无可用替代教练）\n");
            }
        }
        
        coach.setOnLeave(true);
        dataStore.saveCoach(coach);
        
        return new Result(true, message.toString());
    }
    
    public Object cancelClass(Long classId, String reason) {
        GymClass gymClass = dataStore.getClass(classId);
        if (gymClass == null) {
            return new Result(false, "课程不存在");
        }
        
        if (gymClass.isCancelled()) {
            return new Result(false, "课程已取消");
        }
        
        return cancelClass(gymClass, reason);
    }
    
    private Result cancelClass(GymClass gymClass, String reason) {
        gymClass.setStatus(GymClass.STATUS_CANCELLED);
        dataStore.saveClass(gymClass);
        
        List<Booking> bookings = dataStore.getBookingsByClassId(gymClass.getId()).stream()
                .filter(Booking::isActive)
                .collect(Collectors.toList());
        
        for (Booking booking : bookings) {
            if (booking.getLessonsDeducted() != null && booking.getLessonsDeducted() > 0) {
                User user = dataStore.getUser(booking.getUserId());
                if (user != null) {
                    user.addLessons(booking.getLessonsDeducted());
                    dataStore.saveUser(user);
                }
            }
            
            booking.markAsCancelled(reason);
            dataStore.saveBooking(booking);
            
            notificationService.createNotification(
                    booking.getUserId(),
                    Notification.TYPE_CLASS_CANCELLED,
                    "课程取消通知",
                    "您预约的【" + gymClass.getName() + "】已取消，原因：" + reason + 
                    "。已退还" + gymClass.getRequiredLessons() + "课时。"
            );
        }
        
        return new Result(true, "课程已取消，已通知所有预约用户并退还课时");
    }
    
    public List<Coach> getAllCoaches() {
        return dataStore.getAllCoaches();
    }
    
    public Coach getCoachById(Long id) {
        return dataStore.getCoach(id);
    }
    
    public static class Result {
        private boolean success;
        private String message;
        private Object data;
        
        public Result(boolean success, String message) {
            this.success = success;
            this.message = message;
        }
        
        public Result(boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
        }
        
        public boolean isSuccess() {
            return success;
        }
        
        public void setSuccess(boolean success) {
            this.success = success;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
        
        public Object getData() {
            return data;
        }
        
        public void setData(Object data) {
            this.data = data;
        }
    }
}

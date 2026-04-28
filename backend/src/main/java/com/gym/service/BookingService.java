package com.gym.service;

import com.gym.entity.*;
import com.gym.store.DataStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookingService {
    
    @Autowired
    private DataStore dataStore;
    
    @Autowired
    private NotificationService notificationService;
    
    public Object bookClass(Long userId, Long classId) {
        User user = dataStore.getUser(userId);
        if (user == null) {
            return new Result(false, "用户不存在");
        }
        
        if (!user.canBook()) {
            if (user.getBlacklisted()) {
                return new Result(false, "您已被加入黑名单，无法预约");
            }
            if (user.getNoShowCount() >= 3) {
                return new Result(false, "您爽约次数过多，暂时无法预约");
            }
            return new Result(false, "您的信用分不足，无法预约");
        }
        
        GymClass gymClass = dataStore.getClass(classId);
        if (gymClass == null) {
            return new Result(false, "课程不存在");
        }
        
        if (!gymClass.isAvailable()) {
            return new Result(false, "课程已结束或已取消");
        }
        
        if (LocalDateTime.now().isAfter(gymClass.getStartTime())) {
            return new Result(false, "课程已开始，无法预约");
        }
        
        List<Booking> existingBookings = dataStore.getBookingsByUserId(userId).stream()
                .filter(b -> classId.equals(b.getClassId()))
                .filter(b -> b.isActive())
                .collect(Collectors.toList());
        
        if (!existingBookings.isEmpty()) {
            return new Result(false, "您已预约或在候补该课程");
        }
        
        if (user.getLessonBalance() < gymClass.getRequiredLessons()) {
            return new Result(false, "课时余额不足，需要" + gymClass.getRequiredLessons() + "课时，当前余额" + user.getLessonBalance() + "课时");
        }
        
        int currentBookedCount = getBookedCount(classId);
        
        if (currentBookedCount < gymClass.getMaxCapacity()) {
            Booking booking = new Booking();
            booking.setUserId(userId);
            booking.setClassId(classId);
            booking.setStatus(Booking.STATUS_BOOKED);
            dataStore.saveBooking(booking);
            
            notificationService.createNotification(
                    userId,
                    Notification.TYPE_BOOKING_SUCCESS,
                    "预约成功",
                    "您已成功预约【" + gymClass.getName() + "】，上课时间：" + gymClass.getStartTime()
            );
            
            return new Result(true, "预约成功", booking);
        } else {
            List<WaitlistEntry> waitlist = dataStore.getWaitlistByClassId(classId);
            int nextPosition = waitlist.size() + 1;
            
            WaitlistEntry waitlistEntry = new WaitlistEntry();
            waitlistEntry.setUserId(userId);
            waitlistEntry.setClassId(classId);
            waitlistEntry.setPosition(nextPosition);
            dataStore.saveWaitlistEntry(waitlistEntry);
            
            Booking booking = new Booking();
            booking.setUserId(userId);
            booking.setClassId(classId);
            booking.setStatus(Booking.STATUS_WAITLIST);
            dataStore.saveBooking(booking);
            
            notificationService.createNotification(
                    userId,
                    Notification.TYPE_BOOKING_WAITLIST,
                    "候补成功",
                    "您已进入【" + gymClass.getName() + "】的候补队列，当前位置：第" + nextPosition + "位"
            );
            
            return new Result(true, "课程已满，已加入候补队列，当前位置：第" + nextPosition + "位", waitlistEntry);
        }
    }
    
    public Object cancelBooking(Long bookingId, String reason) {
        Booking booking = dataStore.getBooking(bookingId);
        if (booking == null) {
            return new Result(false, "预约记录不存在");
        }
        
        if (!booking.isActive()) {
            return new Result(false, "该预约已取消或已完成");
        }
        
        GymClass gymClass = dataStore.getClass(booking.getClassId());
        if (gymClass == null) {
            return new Result(false, "课程不存在");
        }
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startTime = gymClass.getStartTime();
        
        if (booking.isWaitlist()) {
            booking.markAsCancelled(reason != null ? reason : "用户取消候补");
            dataStore.saveBooking(booking);
            
            List<WaitlistEntry> waitlistEntries = dataStore.getWaitlistByClassId(booking.getClassId());
            for (WaitlistEntry entry : waitlistEntries) {
                if (booking.getUserId().equals(entry.getUserId()) && !entry.getPromoted()) {
                    entry.setPromoted(true);
                    entry.setPromotedAt(now);
                    dataStore.saveWaitlistEntry(entry);
                    break;
                }
            }
            
            notificationService.createNotification(
                    booking.getUserId(),
                    Notification.TYPE_CANCEL_SUCCESS,
                    "取消候补成功",
                    "您已取消【" + gymClass.getName() + "】的候补"
            );
            
            return new Result(true, "取消候补成功");
        }
        
        Duration durationBeforeClass = Duration.between(now, startTime);
        long hoursBeforeClass = durationBeforeClass.toHours();
        
        boolean shouldDeduct = hoursBeforeClass < 24;
        int lessonsToDeduct = shouldDeduct ? gymClass.getRequiredLessons() : 0;
        
        booking.markAsCancelled(reason != null ? reason : "用户取消预约");
        booking.setLessonsDeducted(lessonsToDeduct);
        dataStore.saveBooking(booking);
        
        if (shouldDeduct) {
            User user = dataStore.getUser(booking.getUserId());
            if (user != null) {
                user.deductLessons(lessonsToDeduct);
                dataStore.saveUser(user);
            }
        }
        
        promoteWaitlistUser(booking.getClassId());
        
        String message = shouldDeduct 
                ? "取消预约成功，由于距开课不足24小时，已扣除" + lessonsToDeduct + "课时"
                : "取消预约成功，已全额退还课时";
        
        notificationService.createNotification(
                booking.getUserId(),
                Notification.TYPE_CANCEL_SUCCESS,
                "取消预约成功",
                "您已取消【" + gymClass.getName() + "】的预约，" + message
        );
        
        return new Result(true, message);
    }
    
    private void promoteWaitlistUser(Long classId) {
        List<WaitlistEntry> waitlist = dataStore.getWaitlistByClassId(classId);
        if (waitlist.isEmpty()) {
            return;
        }
        
        WaitlistEntry firstEntry = waitlist.get(0);
        User user = dataStore.getUser(firstEntry.getUserId());
        GymClass gymClass = dataStore.getClass(classId);
        
        if (user == null || gymClass == null) {
            return;
        }
        
        if (user.getLessonBalance() < gymClass.getRequiredLessons()) {
            firstEntry.setPromoted(true);
            dataStore.saveWaitlistEntry(firstEntry);
            
            List<Booking> bookings = dataStore.getBookingsByUserId(firstEntry.getUserId());
            for (Booking booking : bookings) {
                if (classId.equals(booking.getClassId()) && booking.isWaitlist()) {
                    booking.markAsCancelled("课时不足，候补失败");
                    dataStore.saveBooking(booking);
                    break;
                }
            }
            
            promoteWaitlistUser(classId);
            return;
        }
        
        firstEntry.promote();
        dataStore.saveWaitlistEntry(firstEntry);
        
        List<Booking> bookings = dataStore.getBookingsByUserId(firstEntry.getUserId());
        for (Booking booking : bookings) {
            if (classId.equals(booking.getClassId()) && booking.isWaitlist()) {
                booking.setStatus(Booking.STATUS_BOOKED);
                dataStore.saveBooking(booking);
                break;
            }
        }
        
        for (int i = 1; i < waitlist.size(); i++) {
            WaitlistEntry entry = waitlist.get(i);
            if (!entry.getPromoted()) {
                entry.setPosition(entry.getPosition() - 1);
                dataStore.saveWaitlistEntry(entry);
            }
        }
        
        notificationService.createNotification(
                firstEntry.getUserId(),
                Notification.TYPE_WAITLIST_PROMOTED,
                "候补成功",
                "恭喜！您已从候补队列中晋升，成功预约【" + gymClass.getName() + "】"
        );
    }
    
    public int getBookedCount(Long classId) {
        List<Booking> bookings = dataStore.getBookingsByClassId(classId);
        return (int) bookings.stream()
                .filter(b -> Booking.STATUS_BOOKED.equals(b.getStatus()))
                .count();
    }
    
    public int getWaitlistCount(Long classId) {
        List<WaitlistEntry> waitlist = dataStore.getWaitlistByClassId(classId);
        return waitlist.size();
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

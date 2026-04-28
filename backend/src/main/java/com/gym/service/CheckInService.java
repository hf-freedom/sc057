package com.gym.service;

import com.gym.entity.*;
import com.gym.store.DataStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CheckInService {
    
    @Autowired
    private DataStore dataStore;
    
    @Autowired
    private NotificationService notificationService;
    
    public Object checkIn(Long bookingId, String method) {
        Booking booking = dataStore.getBooking(bookingId);
        if (booking == null) {
            return new Result(false, "预约记录不存在");
        }
        
        if (!Booking.STATUS_BOOKED.equals(booking.getStatus())) {
            return new Result(false, "该预约状态不可签到，当前状态：" + booking.getStatus());
        }
        
        GymClass gymClass = dataStore.getClass(booking.getClassId());
        if (gymClass == null) {
            return new Result(false, "课程不存在");
        }
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startTime = gymClass.getStartTime();
        
        if (now.isBefore(startTime.minusMinutes(30))) {
            return new Result(false, "签到时间未到，课程开始前30分钟可签到");
        }
        
        if (now.isAfter(startTime.plusMinutes(15))) {
            return new Result(false, "已过签到时间，课程开始后15分钟停止签到");
        }
        
        User user = dataStore.getUser(booking.getUserId());
        if (user == null) {
            return new Result(false, "用户不存在");
        }
        
        int requiredLessons = gymClass.getRequiredLessons();
        if (user.getLessonBalance() < requiredLessons) {
            return new Result(false, "课时余额不足，无法签到");
        }
        
        user.deductLessons(requiredLessons);
        dataStore.saveUser(user);
        
        booking.markAsCheckedIn();
        booking.setLessonsDeducted(requiredLessons);
        dataStore.saveBooking(booking);
        
        CheckInRecord record = new CheckInRecord();
        record.setBookingId(bookingId);
        record.setUserId(booking.getUserId());
        record.setClassId(booking.getClassId());
        record.setCheckInMethod(method != null ? method : CheckInRecord.METHOD_MANUAL);
        record.setLessonsDeducted(requiredLessons);
        dataStore.saveCheckInRecord(record);
        
        notificationService.createNotification(
                booking.getUserId(),
                Notification.TYPE_CHECKIN_SUCCESS,
                "签到成功",
                "您已成功签到【" + gymClass.getName() + "】，已扣除" + requiredLessons + "课时，当前余额：" + user.getLessonBalance() + "课时"
        );
        
        return new Result(true, "签到成功，已扣除" + requiredLessons + "课时", record);
    }
    
    public List<Booking> getBookingsForCheckIn(Long classId) {
        List<Booking> bookings = dataStore.getBookingsByClassId(classId);
        return bookings.stream()
                .filter(b -> Booking.STATUS_BOOKED.equals(b.getStatus()))
                .collect(Collectors.toList());
    }
    
    public List<CheckInRecord> getCheckInRecordsByClass(Long classId) {
        List<CheckInRecord> allRecords = dataStore.getAllCheckInRecords();
        return allRecords.stream()
                .filter(r -> classId.equals(r.getClassId()))
                .collect(Collectors.toList());
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

package com.gym.controller;

import com.gym.entity.*;
import com.gym.service.*;
import com.gym.store.DataStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3002")
public class ClassController {
    
    @Autowired
    private DataStore dataStore;
    
    @Autowired
    private BookingService bookingService;
    
    @Autowired
    private CheckInService checkInService;
    
    @Autowired
    private NoShowService noShowService;
    
    @Autowired
    private CoachService coachService;
    
    @Autowired
    private SettlementService settlementService;
    
    @Autowired
    private NotificationService notificationService;
    
    @GetMapping("/classes")
    public ResponseEntity<List<GymClass>> getAllClasses() {
        return ResponseEntity.ok(dataStore.getAllClasses());
    }
    
    @GetMapping("/classes/{id}")
    public ResponseEntity<Map<String, Object>> getClassDetail(@PathVariable Long id) {
        GymClass gymClass = dataStore.getClass(id);
        if (gymClass == null) {
            return ResponseEntity.notFound().build();
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("class", gymClass);
        
        Coach coach = dataStore.getCoach(gymClass.getCoachId());
        result.put("coach", coach);
        
        int bookedCount = bookingService.getBookedCount(id);
        int waitlistCount = bookingService.getWaitlistCount(id);
        result.put("bookedCount", bookedCount);
        result.put("waitlistCount", waitlistCount);
        result.put("availableSlots", gymClass.getMaxCapacity() - bookedCount);
        
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/classes")
    public ResponseEntity<GymClass> createClass(@RequestBody GymClass gymClass) {
        dataStore.saveClass(gymClass);
        return ResponseEntity.ok(gymClass);
    }
    
    @DeleteMapping("/classes/{id}")
    public ResponseEntity<Object> cancelClass(@PathVariable Long id, 
                                               @RequestParam(required = false) String reason) {
        if (reason == null) {
            reason = "管理员取消";
        }
        Object result = coachService.cancelClass(id, reason);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(dataStore.getAllUsers());
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        User user = dataStore.getUser(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }
    
    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        dataStore.saveUser(user);
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/coaches")
    public ResponseEntity<List<Coach>> getAllCoaches() {
        return ResponseEntity.ok(dataStore.getAllCoaches());
    }
    
    @PostMapping("/coaches/{id}/leave")
    public ResponseEntity<Object> coachOnLeave(@PathVariable Long id,
                                                 @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime leaveStart,
                                                 @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime leaveEnd) {
        Object result = coachService.coachOnLeave(id, leaveStart, leaveEnd);
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/bookings")
    public ResponseEntity<Object> bookClass(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        Long classId = request.get("classId");
        if (userId == null || classId == null) {
            return ResponseEntity.badRequest().build();
        }
        Object result = bookingService.bookClass(userId, classId);
        return ResponseEntity.ok(result);
    }
    
    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<Object> cancelBooking(@PathVariable Long id,
                                                   @RequestParam(required = false) String reason) {
        if (reason == null) {
            reason = "用户取消";
        }
        Object result = bookingService.cancelBooking(id, reason);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(dataStore.getAllBookings());
    }
    
    @GetMapping("/bookings/user/{userId}")
    public ResponseEntity<List<Booking>> getUserBookings(@PathVariable Long userId) {
        return ResponseEntity.ok(dataStore.getBookingsByUserId(userId));
    }
    
    @GetMapping("/bookings/class/{classId}")
    public ResponseEntity<List<Booking>> getClassBookings(@PathVariable Long classId) {
        return ResponseEntity.ok(dataStore.getBookingsByClassId(classId));
    }
    
    @PostMapping("/checkin")
    public ResponseEntity<Object> checkIn(@RequestBody Map<String, Object> request) {
        Long bookingId = Long.valueOf(request.get("bookingId").toString());
        String method = request.containsKey("method") ? request.get("method").toString() : null;
        Object result = checkInService.checkIn(bookingId, method);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/checkin/class/{classId}")
    public ResponseEntity<List<CheckInRecord>> getClassCheckIns(@PathVariable Long classId) {
        return ResponseEntity.ok(checkInService.getCheckInRecordsByClass(classId));
    }
    
    @GetMapping("/waitlist/class/{classId}")
    public ResponseEntity<List<WaitlistEntry>> getClassWaitlist(@PathVariable Long classId) {
        return ResponseEntity.ok(dataStore.getWaitlistByClassId(classId));
    }
    
    @GetMapping("/noshow")
    public ResponseEntity<List<NoShowRecord>> getAllNoShows() {
        return ResponseEntity.ok(noShowService.getAllNoShowRecords());
    }
    
    @GetMapping("/noshow/user/{userId}")
    public ResponseEntity<List<NoShowRecord>> getUserNoShows(@PathVariable Long userId) {
        return ResponseEntity.ok(noShowService.getUserNoShowRecords(userId));
    }
    
    @GetMapping("/settlements")
    public ResponseEntity<List<Settlement>> getAllSettlements() {
        return ResponseEntity.ok(settlementService.getAllSettlements());
    }
    
    @PostMapping("/settlements/generate")
    public ResponseEntity<Object> generateSettlements(@RequestParam(required = false) Integer year,
                                                       @RequestParam(required = false) Integer month) {
        YearMonth targetMonth;
        if (year != null && month != null) {
            targetMonth = YearMonth.of(year, month);
        } else {
            targetMonth = YearMonth.now().minusMonths(1);
        }
        Object result = settlementService.generateSettlementsForMonth(targetMonth);
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/settlements/{id}/pay")
    public ResponseEntity<Object> paySettlement(@PathVariable Long id) {
        Object result = settlementService.paySettlement(id);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/notifications/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }
    
    @PostMapping("/notifications/{id}/read")
    public ResponseEntity<Map<String, Object>> markNotificationAsRead(@PathVariable Long id) {
        boolean success = notificationService.markAsRead(id);
        Map<String, Object> result = new HashMap<>();
        result.put("success", success);
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/notifications/user/{userId}/read-all")
    public ResponseEntity<Map<String, Object>> markAllNotificationsAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        
        dashboard.put("totalClasses", dataStore.getAllClasses().size());
        dashboard.put("totalUsers", dataStore.getAllUsers().size());
        dashboard.put("totalCoaches", dataStore.getAllCoaches().size());
        dashboard.put("totalBookings", dataStore.getAllBookings().size());
        dashboard.put("totalNoShows", dataStore.getAllNoShowRecords().size());
        
        long activeBookings = dataStore.getAllBookings().stream()
                .filter(Booking::isActive)
                .count();
        dashboard.put("activeBookings", activeBookings);
        
        return ResponseEntity.ok(dashboard);
    }
}

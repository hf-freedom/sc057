package com.gym.service;

import com.gym.entity.*;
import com.gym.store.DataStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SettlementService {
    
    private static final BigDecimal RATE_PER_STUDENT = new BigDecimal("50");
    
    @Autowired
    private DataStore dataStore;
    
    @Autowired
    private NotificationService notificationService;
    
    @Scheduled(cron = "0 0 1 1 * ?")
    public void generateMonthlySettlements() {
        YearMonth currentMonth = YearMonth.now();
        YearMonth lastMonth = currentMonth.minusMonths(1);
        generateSettlementsForMonth(lastMonth);
    }
    
    public Object generateSettlementsForMonth(YearMonth month) {
        List<Coach> coaches = dataStore.getAllCoaches();
        List<Settlement> settlements = new ArrayList<>();
        
        for (Coach coach : coaches) {
            Settlement settlement = calculateSettlement(coach, month);
            if (settlement != null) {
                dataStore.saveSettlement(settlement);
                settlements.add(settlement);
                
                notificationService.createNotification(
                        coach.getId(),
                        Notification.TYPE_SETTLEMENT_GENERATED,
                        "结算单生成",
                        coach.getName() + "教练，" + month.getYear() + "年" + month.getMonthValue() + 
                        "月结算单已生成，总金额：" + settlement.getTotalAmount() + "元"
                );
            }
        }
        
        return new Result(true, "已为" + month + "生成" + settlements.size() + "份结算单", settlements);
    }
    
    private Settlement calculateSettlement(Coach coach, YearMonth month) {
        List<GymClass> coachClasses = dataStore.getAllClasses().stream()
                .filter(c -> coach.getId().equals(c.getCoachId()))
                .filter(c -> {
                    YearMonth classMonth = YearMonth.from(c.getStartTime());
                    return classMonth.equals(month);
                })
                .filter(c -> GymClass.STATUS_COMPLETED.equals(c.getStatus()))
                .collect(Collectors.toList());
        
        if (coachClasses.isEmpty()) {
            return null;
        }
        
        int totalStudents = 0;
        for (GymClass gymClass : coachClasses) {
            List<CheckInRecord> checkIns = dataStore.getAllCheckInRecords().stream()
                    .filter(r -> gymClass.getId().equals(r.getClassId()))
                    .collect(Collectors.toList());
            totalStudents += checkIns.size();
        }
        
        BigDecimal totalAmount = RATE_PER_STUDENT.multiply(new BigDecimal(totalStudents));
        
        Settlement settlement = new Settlement();
        settlement.setCoachId(coach.getId());
        settlement.setSettlementMonth(month);
        settlement.setTotalClasses(coachClasses.size());
        settlement.setTotalStudents(totalStudents);
        settlement.setTotalAmount(totalAmount);
        settlement.setStatus(Settlement.STATUS_PENDING);
        
        return settlement;
    }
    
    public List<Settlement> getAllSettlements() {
        return dataStore.getAllSettlements();
    }
    
    public List<Settlement> getSettlementsByCoach(Long coachId) {
        return dataStore.getAllSettlements().stream()
                .filter(s -> coachId.equals(s.getCoachId()))
                .collect(Collectors.toList());
    }
    
    public Object paySettlement(Long settlementId) {
        Settlement settlement = dataStore.getSettlement(settlementId);
        if (settlement == null) {
            return new Result(false, "结算单不存在");
        }
        
        if (Settlement.STATUS_PAID.equals(settlement.getStatus())) {
            return new Result(false, "结算单已支付");
        }
        
        settlement.markAsPaid();
        dataStore.saveSettlement(settlement);
        
        return new Result(true, "结算单已支付", settlement);
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

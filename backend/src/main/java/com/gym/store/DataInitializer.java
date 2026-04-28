package com.gym.store;

import com.gym.entity.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private DataStore dataStore;
    
    @Override
    public void run(String... args) {
        initCoaches();
        initUsers();
        initClasses();
    }
    
    private void initCoaches() {
        Coach coach1 = new Coach();
        coach1.setId(dataStore.nextCoachId());
        coach1.setName("张教练");
        coach1.setPhone("13800138001");
        coach1.setSpecialty("瑜伽、普拉提");
        dataStore.saveCoach(coach1);
        
        Coach coach2 = new Coach();
        coach2.setId(dataStore.nextCoachId());
        coach2.setName("李教练");
        coach2.setPhone("13800138002");
        coach2.setSpecialty("动感单车、HIIT");
        dataStore.saveCoach(coach2);
        
        Coach coach3 = new Coach();
        coach3.setId(dataStore.nextCoachId());
        coach3.setName("王教练");
        coach3.setPhone("13800138003");
        coach3.setSpecialty("拳击、力量训练");
        dataStore.saveCoach(coach3);
    }
    
    private void initUsers() {
        User user1 = new User();
        user1.setId(dataStore.nextUserId());
        user1.setName("小明");
        user1.setPhone("13900139001");
        user1.setLessonBalance(20);
        user1.setCreditScore(100);
        dataStore.saveUser(user1);
        
        User user2 = new User();
        user2.setId(dataStore.nextUserId());
        user2.setName("小红");
        user2.setPhone("13900139002");
        user2.setLessonBalance(15);
        user2.setCreditScore(95);
        dataStore.saveUser(user2);
        
        User user3 = new User();
        user3.setId(dataStore.nextUserId());
        user3.setName("小刚");
        user3.setPhone("13900139003");
        user3.setLessonBalance(30);
        user3.setCreditScore(100);
        dataStore.saveUser(user3);
        
        User user4 = new User();
        user4.setId(dataStore.nextUserId());
        user4.setName("小丽");
        user4.setPhone("13900139004");
        user4.setLessonBalance(5);
        user4.setCreditScore(85);
        dataStore.saveUser(user4);
    }
    
    private void initClasses() {
        LocalDateTime now = LocalDateTime.now();
        
        GymClass class1 = new GymClass();
        class1.setId(dataStore.nextClassId());
        class1.setName("基础瑜伽");
        class1.setCoachId(1L);
        class1.setStartTime(now.plusDays(1).withHour(9).withMinute(0).truncatedTo(ChronoUnit.HOURS));
        class1.setEndTime(class1.getStartTime().plusHours(1));
        class1.setMaxCapacity(10);
        class1.setRequiredLessons(1);
        class1.setStatus(GymClass.STATUS_SCHEDULED);
        dataStore.saveClass(class1);
        
        GymClass class2 = new GymClass();
        class2.setId(dataStore.nextClassId());
        class2.setName("动感单车");
        class2.setCoachId(2L);
        class2.setStartTime(now.plusDays(1).withHour(10).withMinute(0).truncatedTo(ChronoUnit.HOURS));
        class2.setEndTime(class2.getStartTime().plusHours(1));
        class2.setMaxCapacity(15);
        class2.setRequiredLessons(1);
        class2.setStatus(GymClass.STATUS_SCHEDULED);
        dataStore.saveClass(class2);
        
        GymClass class3 = new GymClass();
        class3.setId(dataStore.nextClassId());
        class3.setName("拳击训练");
        class3.setCoachId(3L);
        class3.setStartTime(now.plusDays(1).withHour(14).withMinute(0).truncatedTo(ChronoUnit.HOURS));
        class3.setEndTime(class3.getStartTime().plusHours(1).plusMinutes(30));
        class3.setMaxCapacity(8);
        class3.setRequiredLessons(2);
        class3.setStatus(GymClass.STATUS_SCHEDULED);
        dataStore.saveClass(class3);
        
        GymClass class4 = new GymClass();
        class4.setId(dataStore.nextClassId());
        class4.setName("普拉提塑形");
        class4.setCoachId(1L);
        class4.setStartTime(now.plusDays(2).withHour(9).withMinute(0).truncatedTo(ChronoUnit.HOURS));
        class4.setEndTime(class4.getStartTime().plusHours(1));
        class4.setMaxCapacity(10);
        class4.setRequiredLessons(1);
        class4.setStatus(GymClass.STATUS_SCHEDULED);
        dataStore.saveClass(class4);
        
        GymClass class5 = new GymClass();
        class5.setId(dataStore.nextClassId());
        class5.setName("HIIT高强度训练");
        class5.setCoachId(2L);
        class5.setStartTime(now.plusDays(2).withHour(16).withMinute(0).truncatedTo(ChronoUnit.HOURS));
        class5.setEndTime(class5.getStartTime().plusMinutes(45));
        class5.setMaxCapacity(12);
        class5.setRequiredLessons(1);
        class5.setStatus(GymClass.STATUS_SCHEDULED);
        dataStore.saveClass(class5);
    }
}

package com.gym.service;

import com.gym.entity.Notification;
import com.gym.store.DataStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    
    @Autowired
    private DataStore dataStore;
    
    public void createNotification(Long userId, String type, String title, String content) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setContent(content);
        dataStore.saveNotification(notification);
    }
    
    public List<Notification> getUserNotifications(Long userId) {
        return dataStore.getNotificationsByUserId(userId);
    }
    
    public List<Notification> getUnreadNotifications(Long userId) {
        List<Notification> notifications = dataStore.getNotificationsByUserId(userId);
        notifications.removeIf(Notification::getRead);
        return notifications;
    }
    
    public boolean markAsRead(Long notificationId) {
        Notification notification = dataStore.getNotification(notificationId);
        if (notification != null) {
            notification.markAsRead();
            dataStore.saveNotification(notification);
            return true;
        }
        return false;
    }
    
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = dataStore.getNotificationsByUserId(userId);
        for (Notification notification : notifications) {
            if (!notification.getRead()) {
                notification.markAsRead();
                dataStore.saveNotification(notification);
            }
        }
    }
}

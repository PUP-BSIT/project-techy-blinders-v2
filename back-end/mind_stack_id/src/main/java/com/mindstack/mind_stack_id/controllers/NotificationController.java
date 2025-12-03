package com.mindstack.mind_stack_id.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.mindstack.mind_stack_id.models.Notification;
import com.mindstack.mind_stack_id.models.dto.NotificationDTO;
import com.mindstack.mind_stack_id.services.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        try {
            Notification createdNotification = notificationService.createNotification(notification);
            return new ResponseEntity<>(createdNotification, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);

        }
    }

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getAllNotifications() {
        try {
            List<NotificationDTO> notifications = notificationService.getAllNotification();
            if (notifications.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
            }
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotificationById(@PathVariable("id") long id) {
        try {
            Notification notification = notificationService.getNotifyId(id);
            if (notification != null) {
                return ResponseEntity.ok(notification);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO>> getNotificationsByUserId(@PathVariable("userId") long userId) {
        try {
            List<NotificationDTO> notifications = notificationService.getNotificationByUserId(userId);
            if (notifications.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
            }
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Notification> updateNotification(
            @PathVariable("id") long id,
            @RequestBody Notification notification) {
        try {
            Notification updatedNotification = notificationService.updateNotification(id, notification);
            if (updatedNotification != null) {
                return ResponseEntity.ok(updatedNotification);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<String> markAsRead(@PathVariable("id") long id) {
        try {
            boolean success = notificationService.markAsRead(id);
            if (success) {
                return ResponseEntity.ok("Notification marked as read");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Notification not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error marking notification as read");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNotification(@PathVariable("id") long id) {
        try {
            boolean success = notificationService.deleteNotification(id);
            if (success) {
                return ResponseEntity.ok("Notification deleted successfully");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Notification not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting notification");
        }
    }
}
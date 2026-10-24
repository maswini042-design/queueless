package com.queueless.models;

import java.io.Serializable;
import java.util.Date;

/**
 * In-app Notification model for queue events (e.g. called, nearing front of queue).
 */
public class Notification implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;
    private String userId;
    private String title;
    private String message;
    private String type; // INFO, ALERT, SUCCESS, WARNING
    private boolean read;
    private Date createdAt;

    public Notification() {
        this.read = false;
        this.createdAt = new Date();
    }

    public Notification(String id, String userId, String title, String message, String type) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.read = false;
        this.createdAt = new Date();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}

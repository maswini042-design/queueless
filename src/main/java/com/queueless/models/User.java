package com.queueless.models;

import java.io.Serializable;
import java.util.Date;

/**
 * Model representing a QueueLess user with multi-role access control (ADMIN, STAFF, USER).
 */
public class User implements Serializable {
    private static final long serialVersionUID = 1L;

    public enum Role {
        ADMIN,
        STAFF,
        USER,
        STUDENT // legacy alias for USER
    }

    private String id;
    private String name;
    private String email;
    private transient String passwordHash; // excluded from direct public JSON serialization
    private Role role;
    private String phone;
    private Date createdAt;
    private Date updatedAt;
    private boolean active;

    public User() {
        this.role = Role.USER;
        this.active = true;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public User(String id, String name, String email, Role role, String phone) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role != null ? role : Role.USER;
        this.phone = phone;
        this.active = true;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    // Normalized role check
    public boolean isUser() {
        return this.role == Role.USER || this.role == Role.STUDENT;
    }

    public boolean isStaff() {
        return this.role == Role.STAFF;
    }

    public boolean isAdmin() {
        return this.role == Role.ADMIN;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}

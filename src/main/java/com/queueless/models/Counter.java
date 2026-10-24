package com.queueless.models;

import java.io.Serializable;
import java.util.Date;

/**
 * Service Counter model representing service counters (e.g., Admissions, Fee Payment, Registrar).
 */
public class Counter implements Serializable {
    private static final long serialVersionUID = 1L;

    public enum Status {
        ACTIVE,
        PAUSED,
        CLOSED
    }

    private String id;
    private String counterName;
    private String code; // e.g. "ADM", "FEE", "REG"
    private String description;
    private int averageServiceMinutes;
    private String staffId;
    private String staffName;
    private Status status;
    private Date createdAt;
    private Date updatedAt;

    public Counter() {
        this.status = Status.ACTIVE;
        this.averageServiceMinutes = 5;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public Counter(String id, String counterName, String code, String description, int averageServiceMinutes, String staffId) {
        this.id = id;
        this.counterName = counterName;
        this.code = code;
        this.description = description;
        this.averageServiceMinutes = averageServiceMinutes;
        this.staffId = staffId;
        this.status = Status.ACTIVE;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCounterName() { return counterName; }
    public void setCounterName(String counterName) { this.counterName = counterName; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getAverageServiceMinutes() { return averageServiceMinutes; }
    public void setAverageServiceMinutes(int averageServiceMinutes) { this.averageServiceMinutes = averageServiceMinutes; }

    public String getStaffId() { return staffId; }
    public void setStaffId(String staffId) { this.staffId = staffId; }

    public String getStaffName() { return staffName; }
    public void setStaffName(String staffName) { this.staffName = staffName; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
}

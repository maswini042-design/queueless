package com.queueless.models;

import java.io.Serializable;
import java.util.Date;

/**
 * ServiceHistory records historical servicing times for precise ML and statistical prediction.
 */
public class ServiceHistory implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;
    private String tokenId;
    private String tokenNumber;
    private String counterId;
    private String counterName;
    private String staffId;
    private String staffName;
    private long serviceDurationSeconds;
    private long waitingDurationSeconds;
    private Date completedAt;

    public ServiceHistory() {}

    public ServiceHistory(String id, String tokenId, String tokenNumber, String counterId, String staffId, long serviceDurationSeconds, long waitingDurationSeconds, Date completedAt) {
        this.id = id;
        this.tokenId = tokenId;
        this.tokenNumber = tokenNumber;
        this.counterId = counterId;
        this.staffId = staffId;
        this.serviceDurationSeconds = serviceDurationSeconds;
        this.waitingDurationSeconds = waitingDurationSeconds;
        this.completedAt = completedAt != null ? completedAt : new Date();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTokenId() { return tokenId; }
    public void setTokenId(String tokenId) { this.tokenId = tokenId; }

    public String getTokenNumber() { return tokenNumber; }
    public void setTokenNumber(String tokenNumber) { this.tokenNumber = tokenNumber; }

    public String getCounterId() { return counterId; }
    public void setCounterId(String counterId) { this.counterId = counterId; }

    public String getCounterName() { return counterName; }
    public void setCounterName(String counterName) { this.counterName = counterName; }

    public String getStaffId() { return staffId; }
    public void setStaffId(String staffId) { this.staffId = staffId; }

    public String getStaffName() { return staffName; }
    public void setStaffName(String staffName) { this.staffName = staffName; }

    public long getServiceDurationSeconds() { return serviceDurationSeconds; }
    public void setServiceDurationSeconds(long serviceDurationSeconds) { this.serviceDurationSeconds = serviceDurationSeconds; }

    public long getWaitingDurationSeconds() { return waitingDurationSeconds; }
    public void setWaitingDurationSeconds(long waitingDurationSeconds) { this.waitingDurationSeconds = waitingDurationSeconds; }

    public Date getCompletedAt() { return completedAt; }
    public void setCompletedAt(Date completedAt) { this.completedAt = completedAt; }
}

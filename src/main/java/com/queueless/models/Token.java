package com.queueless.models;

import java.io.Serializable;
import java.util.Date;

/**
 * Queue Token model representing each customer/student token.
 */
public class Token implements Serializable {
    private static final long serialVersionUID = 1L;

    public enum Status {
        WAITING,
        CALLED,
        SERVING,
        COMPLETED,
        CANCELLED,
        SKIPPED
    }

    private String id;
    private String tokenNumber; // e.g. "ADM-101"
    private int sequenceNumber; // 101
    private String userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private String counterId;
    private String counterName;
    private Status status;
    private Date createdAt;
    private Date calledAt;
    private Date serviceStartedAt;
    private Date completedAt;
    private Date cancelledAt;
    private int estimatedWaitMinutes;
    private int queuePosition; // position in waiting line (1 = next)
    private int peopleAhead; // queuePosition - 1

    public Token() {
        this.status = Status.WAITING;
        this.createdAt = new Date();
    }

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTokenNumber() { return tokenNumber; }
    public void setTokenNumber(String tokenNumber) { this.tokenNumber = tokenNumber; }

    public int getSequenceNumber() { return sequenceNumber; }
    public void setSequenceNumber(int sequenceNumber) { this.sequenceNumber = sequenceNumber; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getUserPhone() { return userPhone; }
    public void setUserPhone(String userPhone) { this.userPhone = userPhone; }

    public String getCounterId() { return counterId; }
    public void setCounterId(String counterId) { this.counterId = counterId; }

    public String getCounterName() { return counterName; }
    public void setCounterName(String counterName) { this.counterName = counterName; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getCalledAt() { return calledAt; }
    public void setCalledAt(Date calledAt) { this.calledAt = calledAt; }

    public Date getServiceStartedAt() { return serviceStartedAt; }
    public void setServiceStartedAt(Date serviceStartedAt) { this.serviceStartedAt = serviceStartedAt; }

    public Date getCompletedAt() { return completedAt; }
    public void setCompletedAt(Date completedAt) { this.completedAt = completedAt; }

    public Date getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(Date cancelledAt) { this.cancelledAt = cancelledAt; }

    public int getEstimatedWaitMinutes() { return estimatedWaitMinutes; }
    public void setEstimatedWaitMinutes(int estimatedWaitMinutes) { this.estimatedWaitMinutes = estimatedWaitMinutes; }

    public int getQueuePosition() { return queuePosition; }
    public void setQueuePosition(int queuePosition) { this.queuePosition = queuePosition; }

    public int getPeopleAhead() { return peopleAhead; }
    public void setPeopleAhead(int peopleAhead) { this.peopleAhead = peopleAhead; }
}

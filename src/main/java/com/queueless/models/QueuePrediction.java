package com.queueless.models;

import java.io.Serializable;
import java.util.Date;

/**
 * QueuePrediction encapsulating the output of the QueuePredictionService.
 */
public class QueuePrediction implements Serializable {
    private static final long serialVersionUID = 1L;

    private String counterId;
    private String counterName;
    private int queuePosition;
    private int customersAhead;
    private int estimatedWaitMinutes;
    private double confidenceScore;
    private String explanation;
    private String currentServingToken;
    private Date calculatedAt;

    public QueuePrediction() {
        this.calculatedAt = new Date();
    }

    public QueuePrediction(String counterId, String counterName, int queuePosition, int customersAhead, int estimatedWaitMinutes, double confidenceScore, String explanation, String currentServingToken) {
        this.counterId = counterId;
        this.counterName = counterName;
        this.queuePosition = queuePosition;
        this.customersAhead = customersAhead;
        this.estimatedWaitMinutes = estimatedWaitMinutes;
        this.confidenceScore = confidenceScore;
        this.explanation = explanation;
        this.currentServingToken = currentServingToken;
        this.calculatedAt = new Date();
    }

    public String getCounterId() { return counterId; }
    public void setCounterId(String counterId) { this.counterId = counterId; }

    public String getCounterName() { return counterName; }
    public void setCounterName(String counterName) { this.counterName = counterName; }

    public int getQueuePosition() { return queuePosition; }
    public void setQueuePosition(int queuePosition) { this.queuePosition = queuePosition; }

    public int getCustomersAhead() { return customersAhead; }
    public void setCustomersAhead(int customersAhead) { this.customersAhead = customersAhead; }

    public int getEstimatedWaitMinutes() { return estimatedWaitMinutes; }
    public void setEstimatedWaitMinutes(int estimatedWaitMinutes) { this.estimatedWaitMinutes = estimatedWaitMinutes; }

    public double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(double confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getCurrentServingToken() { return currentServingToken; }
    public void setCurrentServingToken(String currentServingToken) { this.currentServingToken = currentServingToken; }

    public Date getCalculatedAt() { return calculatedAt; }
    public void setCalculatedAt(Date calculatedAt) { this.calculatedAt = calculatedAt; }
}

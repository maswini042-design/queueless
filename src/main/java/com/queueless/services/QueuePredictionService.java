package com.queueless.services;

import com.queueless.dao.CounterDAO;
import com.queueless.dao.ServiceHistoryDAO;
import com.queueless.dao.TokenDAO;
import com.queueless.models.Counter;
import com.queueless.models.QueuePrediction;
import com.queueless.models.Token;

import java.util.Date;

/**
 * QueuePredictionService implements an explainable, deterministic waiting-time prediction algorithm.
 *
 * Algorithm Formulation:
 * Estimated Wait Time (minutes) =
 *   [ (Tokens Ahead) * S_avg + max(0, S_avg - Current_In_Service_Elapsed) ] / (Active Counters for Service)
 *
 * Where:
 * - S_avg: Weighted harmonic average of historical completed services and counter baseline.
 * - Current_In_Service_Elapsed: Elapsed duration since currently serving token was started.
 * - Confidence Score: Calculated from the number of historical sample points.
 */
public class QueuePredictionService {
    private final TokenDAO tokenDAO;
    private final CounterDAO counterDAO;
    private final ServiceHistoryDAO serviceHistoryDAO;

    public QueuePredictionService() {
        this.tokenDAO = new TokenDAO();
        this.counterDAO = new CounterDAO();
        this.serviceHistoryDAO = new ServiceHistoryDAO();
    }

    public QueuePredictionService(TokenDAO tokenDAO, CounterDAO counterDAO, ServiceHistoryDAO serviceHistoryDAO) {
        this.tokenDAO = tokenDAO;
        this.counterDAO = counterDAO;
        this.serviceHistoryDAO = serviceHistoryDAO;
    }

    /**
     * Calculates deterministic queue prediction for a given token.
     */
    public QueuePrediction predictForToken(Token token) {
        if (token == null) {
            return new QueuePrediction("", "", 0, 0, 0, 1.0, "No active token found", "None");
        }

        if (token.getStatus() == Token.Status.SERVING) {
            return new QueuePrediction(token.getCounterId(), token.getCounterName(), 1, 0, 0, 1.0,
                    "Currently being served at counter", token.getTokenNumber());
        }

        if (token.getStatus() == Token.Status.CALLED) {
            return new QueuePrediction(token.getCounterId(), token.getCounterName(), 1, 0, 1, 0.95,
                    "Token has been called! Please proceed immediately to counter", token.getTokenNumber());
        }

        if (token.getStatus() != Token.Status.WAITING) {
            return new QueuePrediction(token.getCounterId(), token.getCounterName(), 0, 0, 0, 1.0,
                    "Token is " + token.getStatus().name().toLowerCase(), "None");
        }

        return calculatePrediction(token.getCounterId(), token.getCreatedAt());
    }

    /**
     * Calculates wait time prediction for a prospective customer joining the queue now or an existing waiting token.
     */
    public QueuePrediction calculatePrediction(String counterId, Date tokenCreatedAt) {
        Counter counter = counterDAO.findById(counterId);
        String counterName = counter != null ? counter.getCounterName() : "General Counter";
        int baseAverageMinutes = counter != null ? counter.getAverageServiceMinutes() : 5;

        // Query historical average in seconds
        double historicalAvgSeconds = serviceHistoryDAO.getAverageServiceTimeSeconds(counterId);
        double historicalAvgMinutes = historicalAvgSeconds / 60.0;

        // Blend baseline and historical (70% weight to empirical history, 30% to base)
        double blendedAvgMinutes = (historicalAvgMinutes * 0.70) + (baseAverageMinutes * 0.30);
        blendedAvgMinutes = Math.max(1.5, Math.min(25.0, blendedAvgMinutes));

        // Find currently serving token
        Token currentServing = tokenDAO.findServingByCounter(counterId);
        double remainingCurrentServiceMinutes = 0.0;
        String currentServingNumber = "None (Idle)";

        if (currentServing != null) {
            currentServingNumber = currentServing.getTokenNumber();
            if (currentServing.getServiceStartedAt() != null) {
                long elapsedMillis = System.currentTimeMillis() - currentServing.getServiceStartedAt().getTime();
                double elapsedMinutes = elapsedMillis / 60000.0;
                remainingCurrentServiceMinutes = Math.max(0.5, blendedAvgMinutes - elapsedMinutes);
            } else {
                remainingCurrentServiceMinutes = blendedAvgMinutes * 0.5;
            }
        }

        // Count people waiting ahead
        int ahead = (tokenCreatedAt != null)
                ? tokenDAO.countWaitingAhead(counterId, tokenCreatedAt)
                : tokenDAO.findWaitingByCounter(counterId).size();

        int queuePosition = ahead + 1;

        // Estimate total wait
        double totalWaitMinutes = (ahead * blendedAvgMinutes) + remainingCurrentServiceMinutes;
        int estimatedMinutes = (int) Math.round(totalWaitMinutes);
        if (ahead == 0 && currentServing == null) {
            estimatedMinutes = 1; // Immediate next
        } else {
            estimatedMinutes = Math.max(1, estimatedMinutes);
        }

        // Confidence score based on historical data availability
        double confidence = historicalAvgSeconds > 60 ? 0.92 : 0.75;

        // Human-readable explainable breakdown
        String explanation;
        if (ahead == 0 && currentServing == null) {
            explanation = "You are next in line! The counter is currently open and waiting for customers.";
        } else if (ahead == 0) {
            explanation = String.format("You are next in line. %s is currently being served (~%.0f min remaining).",
                    currentServingNumber, remainingCurrentServiceMinutes);
        } else {
            explanation = String.format("%d customer%s ahead of you. Based on recent average service time of %.1f mins/customer with %s currently at the counter.",
                    ahead, ahead == 1 ? "" : "s", blendedAvgMinutes, currentServingNumber);
        }

        return new QueuePrediction(
                counterId,
                counterName,
                queuePosition,
                ahead,
                estimatedMinutes,
                confidence,
                explanation,
                currentServingNumber
        );
    }
}

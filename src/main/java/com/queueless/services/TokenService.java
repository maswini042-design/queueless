package com.queueless.services;

import com.queueless.dao.CounterDAO;
import com.queueless.dao.ServiceHistoryDAO;
import com.queueless.dao.TokenDAO;
import com.queueless.models.Counter;
import com.queueless.models.QueuePrediction;
import com.queueless.models.ServiceHistory;
import com.queueless.models.Token;
import com.queueless.models.User;

import java.util.Date;

/**
 * Service managing token lifecycle, concurrency-safe issuance, and valid status transitions.
 */
public class TokenService {
    private final TokenDAO tokenDAO;
    private final CounterDAO counterDAO;
    private final ServiceHistoryDAO serviceHistoryDAO;
    private final QueuePredictionService predictionService;

    public TokenService() {
        this.tokenDAO = new TokenDAO();
        this.counterDAO = new CounterDAO();
        this.serviceHistoryDAO = new ServiceHistoryDAO();
        this.predictionService = new QueuePredictionService(tokenDAO, counterDAO, serviceHistoryDAO);
    }

    /**
     * Issues a new digital token for a student/user at the chosen counter.
     */
    public synchronized Token generateToken(User user, String counterId) throws Exception {
        if (user == null) {
            throw new IllegalArgumentException("User must be authenticated to generate a token.");
        }

        Counter counter = counterDAO.findById(counterId);
        if (counter == null) {
            throw new IllegalArgumentException("Selected service counter not found.");
        }

        if (counter.getStatus() != Counter.Status.ACTIVE) {
            throw new IllegalStateException("This counter is currently not active or temporarily closed.");
        }

        // Prevent duplicate active token for this user at this counter
        Token existing = tokenDAO.findActiveByUserAndCounter(user.getId(), counterId);
        if (existing != null) {
            throw new IllegalStateException("You already have an active token (" + existing.getTokenNumber() + ") at this counter.");
        }

        // Concurrency-safe atomic sequence number
        int seqNum = tokenDAO.getNextSequenceNumber(counter.getCode());
        String tokenNumber = String.format("%s-%03d", counter.getCode(), seqNum);

        Token token = new Token();
        token.setTokenNumber(tokenNumber);
        token.setSequenceNumber(seqNum);
        token.setUserId(user.getId());
        token.setUserName(user.getName());
        token.setUserEmail(user.getEmail());
        token.setUserPhone(user.getPhone());
        token.setCounterId(counter.getId());
        token.setCounterName(counter.getCounterName());
        token.setStatus(Token.Status.WAITING);
        token.setCreatedAt(new Date());

        // Initial prediction
        QueuePrediction prediction = predictionService.calculatePrediction(counter.getId(), token.getCreatedAt());
        token.setEstimatedWaitMinutes(prediction.getEstimatedWaitMinutes());
        token.setQueuePosition(prediction.getQueuePosition());
        token.setPeopleAhead(prediction.getCustomersAhead());

        return tokenDAO.create(token);
    }

    /**
     * Staff calls next token in line.
     */
    public Token callToken(String tokenId, String staffId) throws Exception {
        Token token = tokenDAO.findById(tokenId);
        if (token == null) {
            throw new IllegalArgumentException("Token not found.");
        }
        if (token.getStatus() != Token.Status.WAITING && token.getStatus() != Token.Status.SKIPPED) {
            throw new IllegalStateException("Only WAITING or SKIPPED tokens can be called.");
        }

        tokenDAO.updateStatus(tokenId, Token.Status.CALLED, new Date());
        token.setStatus(Token.Status.CALLED);
        token.setCalledAt(new Date());
        return token;
    }

    /**
     * Staff starts servicing the customer.
     */
    public Token startService(String tokenId, String staffId) throws Exception {
        Token token = tokenDAO.findById(tokenId);
        if (token == null) {
            throw new IllegalArgumentException("Token not found.");
        }
        if (token.getStatus() != Token.Status.CALLED && token.getStatus() != Token.Status.WAITING) {
            throw new IllegalStateException("Token must be CALLED before starting service.");
        }

        tokenDAO.updateStatus(tokenId, Token.Status.SERVING, new Date());
        token.setStatus(Token.Status.SERVING);
        token.setServiceStartedAt(new Date());
        return token;
    }

    /**
     * Staff completes service and logs empirical duration to history.
     */
    public Token completeService(String tokenId, String staffId, String staffName) throws Exception {
        Token token = tokenDAO.findById(tokenId);
        if (token == null) {
            throw new IllegalArgumentException("Token not found.");
        }
        if (token.getStatus() != Token.Status.SERVING && token.getStatus() != Token.Status.CALLED) {
            throw new IllegalStateException("Token is not currently being served.");
        }

        Date now = new Date();
        tokenDAO.updateStatus(tokenId, Token.Status.COMPLETED, now);
        token.setStatus(Token.Status.COMPLETED);
        token.setCompletedAt(now);

        // Calculate service duration
        long serviceDuration = 300; // default 5 mins if not tracked
        if (token.getServiceStartedAt() != null) {
            serviceDuration = (now.getTime() - token.getServiceStartedAt().getTime()) / 1000;
        }

        long waitDuration = 0;
        if (token.getCreatedAt() != null && token.getCalledAt() != null) {
            waitDuration = (token.getCalledAt().getTime() - token.getCreatedAt().getTime()) / 1000;
        }

        ServiceHistory history = new ServiceHistory(
                null,
                token.getId(),
                token.getTokenNumber(),
                token.getCounterId(),
                staffId,
                Math.max(15, serviceDuration),
                Math.max(0, waitDuration),
                now
        );
        history.setCounterName(token.getCounterName());
        history.setStaffName(staffName);
        serviceHistoryDAO.recordService(history);

        return token;
    }

    /**
     * Staff marks token skipped (customer did not show up).
     */
    public Token skipToken(String tokenId) throws Exception {
        Token token = tokenDAO.findById(tokenId);
        if (token == null) {
            throw new IllegalArgumentException("Token not found.");
        }
        tokenDAO.updateStatus(tokenId, Token.Status.SKIPPED, new Date());
        token.setStatus(Token.Status.SKIPPED);
        return token;
    }

    /**
     * User or staff cancels token.
     */
    public Token cancelToken(String tokenId, String userId, boolean isAdminOrStaff) throws Exception {
        Token token = tokenDAO.findById(tokenId);
        if (token == null) {
            throw new IllegalArgumentException("Token not found.");
        }
        if (!isAdminOrStaff && !token.getUserId().equals(userId)) {
            throw new IllegalAccessException("Unauthorized: You cannot cancel another user's token.");
        }
        if (token.getStatus() == Token.Status.COMPLETED || token.getStatus() == Token.Status.CANCELLED) {
            throw new IllegalStateException("Token is already finished or cancelled.");
        }

        Date now = new Date();
        tokenDAO.updateStatus(tokenId, Token.Status.CANCELLED, now);
        token.setStatus(Token.Status.CANCELLED);
        token.setCancelledAt(now);
        return token;
    }
}

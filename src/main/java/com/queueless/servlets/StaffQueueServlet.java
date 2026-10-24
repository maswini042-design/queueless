package com.queueless.servlets;

import com.queueless.dao.CounterDAO;
import com.queueless.dao.ServiceHistoryDAO;
import com.queueless.dao.TokenDAO;
import com.queueless.models.Counter;
import com.queueless.models.Token;
import com.queueless.models.User;
import com.queueless.services.TokenService;
import com.queueless.utils.ResponseUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Servlet handling Staff counter queue operations.
 * Endpoints:
 * - GET  /api/staff/queue
 * - POST /api/staff/queue/{id}/call
 * - POST /api/staff/queue/{id}/start
 * - POST /api/staff/queue/{id}/complete
 * - POST /api/staff/queue/{id}/skip
 * - POST /api/staff/queue/{id}/recall
 */
@WebServlet(name = "StaffQueueServlet", urlPatterns = {"/api/staff/queue", "/api/staff/queue/*"})
public class StaffQueueServlet extends HttpServlet {
    private final TokenDAO tokenDAO = new TokenDAO();
    private final CounterDAO counterDAO = new CounterDAO();
    private final TokenService tokenService = new TokenService();
    private final ServiceHistoryDAO serviceHistoryDAO = new ServiceHistoryDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User staff = getStaffUser(req);
        if (staff == null) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_FORBIDDEN, "Staff authentication required");
            return;
        }

        // Find counter assigned to this staff or use counterId query param
        String counterIdParam = req.getParameter("counterId");
        Counter counter = null;
        if (counterIdParam != null && !counterIdParam.isEmpty()) {
            counter = counterDAO.findById(counterIdParam);
        }
        if (counter == null) {
            counter = counterDAO.findByStaffId(staff.getId());
        }
        if (counter == null) {
            // Pick first active counter as fallback
            List<Counter> active = counterDAO.findActive();
            if (!active.isEmpty()) {
                counter = active.get(0);
            }
        }

        if (counter == null) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "No service counter available. Please create one in Admin.");
            return;
        }

        List<Token> waiting = tokenDAO.findWaitingByCounter(counter.getId());
        Token serving = tokenDAO.findServingByCounter(counter.getId());
        Token called = tokenDAO.findCalledByCounter(counter.getId());
        double avgServiceTimeSec = serviceHistoryDAO.getAverageServiceTimeSeconds(counter.getId());

        Map<String, Object> queueData = new HashMap<>();
        queueData.put("counter", counter);
        queueData.put("waitingQueue", waiting);
        queueData.put("currentlyServing", serving != null ? serving : called);
        queueData.put("calledToken", called);
        queueData.put("waitingCount", waiting.size());
        queueData.put("averageServiceTimeMinutes", Math.round(avgServiceTimeSec / 60.0 * 10.0) / 10.0);

        ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, queueData, "Staff queue data retrieved");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User staff = getStaffUser(req);
        if (staff == null) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_FORBIDDEN, "Staff authentication required");
            return;
        }

        String pathInfo = req.getPathInfo();
        if (pathInfo == null) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid action path");
            return;
        }

        // e.g. /{id}/call, /{id}/start, /{id}/complete, /{id}/skip, /{id}/recall
        String[] parts = pathInfo.split("/");
        if (parts.length < 3) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Usage: /api/staff/queue/{id}/{action}");
            return;
        }

        String tokenId = parts[1];
        String action = parts[2].toLowerCase();

        try {
            Token resultToken;
            switch (action) {
                case "call":
                case "recall":
                    resultToken = tokenService.callToken(tokenId, staff.getId());
                    ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, resultToken, "Token " + resultToken.getTokenNumber() + " called");
                    break;
                case "start":
                    resultToken = tokenService.startService(tokenId, staff.getId());
                    ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, resultToken, "Service started for token " + resultToken.getTokenNumber());
                    break;
                case "complete":
                    resultToken = tokenService.completeService(tokenId, staff.getId(), staff.getName());
                    ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, resultToken, "Service completed for token " + resultToken.getTokenNumber());
                    break;
                case "skip":
                    resultToken = tokenService.skipToken(tokenId);
                    ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, resultToken, "Token skipped");
                    break;
                default:
                    ResponseUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Unknown queue action: " + action);
                    break;
            }
        } catch (IllegalArgumentException | IllegalStateException e) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Operation failed: " + e.getMessage());
        }
    }

    private User getStaffUser(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session == null) return null;
        User user = (User) session.getAttribute("user");
        if (user != null && (user.getRole() == User.Role.STAFF || user.getRole() == User.Role.ADMIN)) {
            return user;
        }
        return null;
    }
}

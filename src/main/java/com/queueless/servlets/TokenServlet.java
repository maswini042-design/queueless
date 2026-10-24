package com.queueless.servlets;

import com.google.gson.JsonObject;
import com.queueless.dao.CounterDAO;
import com.queueless.dao.ServiceHistoryDAO;
import com.queueless.dao.TokenDAO;
import com.queueless.models.QueuePrediction;
import com.queueless.models.Token;
import com.queueless.models.User;
import com.queueless.services.QueuePredictionService;
import com.queueless.services.TokenService;
import com.queueless.utils.JsonUtil;
import com.queueless.utils.ResponseUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Servlet managing token generation, user token tracking, cancellation, and real-time prediction.
 * Endpoints:
 * - POST   /api/tokens
 * - GET    /api/tokens/my
 * - GET    /api/tokens/{id}
 * - GET    /api/tokens/{id}/position
 * - DELETE /api/tokens/{id}
 */
@WebServlet(name = "TokenServlet", urlPatterns = {"/api/tokens", "/api/tokens/*"})
public class TokenServlet extends HttpServlet {
    private final TokenService tokenService = new TokenService();
    private final TokenDAO tokenDAO = new TokenDAO();
    private final CounterDAO counterDAO = new CounterDAO();
    private final ServiceHistoryDAO serviceHistoryDAO = new ServiceHistoryDAO();
    private final QueuePredictionService predictionService = new QueuePredictionService(tokenDAO, counterDAO, serviceHistoryDAO);

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User currentUser = getAuthenticatedUser(req);
        if (currentUser == null) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
            return;
        }

        String pathInfo = req.getPathInfo();
        if (pathInfo == null || "/".equals(pathInfo)) {
            // By default return active token for this user
            Token active = tokenDAO.findActiveByUser(currentUser.getId());
            if (active != null) {
                enrichWithPrediction(active);
            }
            ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, active, "Active token status");
            return;
        }

        if ("/my".equals(pathInfo)) {
            List<Token> myTokens = tokenDAO.findMyTokens(currentUser.getId());
            for (Token t : myTokens) {
                if (t.getStatus() == Token.Status.WAITING) {
                    enrichWithPrediction(t);
                }
            }
            ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, myTokens, "User token history");
            return;
        }

        // Sub-routes: /{id} or /{id}/position
        String[] parts = pathInfo.split("/");
        if (parts.length >= 2) {
            String tokenId = parts[1];
            Token token = tokenDAO.findById(tokenId);
            if (token == null) {
                ResponseUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Token not found");
                return;
            }

            // Check authorization
            if (!token.getUserId().equals(currentUser.getId()) &&
                    currentUser.getRole() != User.Role.ADMIN &&
                    currentUser.getRole() != User.Role.STAFF) {
                ResponseUtil.sendError(resp, HttpServletResponse.SC_FORBIDDEN, "Access denied to this token");
                return;
            }

            if (parts.length == 3 && "position".equals(parts[2])) {
                // Return fresh queue prediction calculation
                QueuePrediction prediction = predictionService.predictForToken(token);
                Map<String, Object> posData = new HashMap<>();
                posData.put("tokenNumber", token.getTokenNumber());
                posData.put("status", token.getStatus().name());
                posData.put("queuePosition", prediction.getQueuePosition());
                posData.put("customersAhead", prediction.getCustomersAhead());
                posData.put("estimatedWaitMinutes", prediction.getEstimatedWaitMinutes());
                posData.put("confidenceScore", prediction.getConfidenceScore());
                posData.put("explanation", prediction.getExplanation());
                posData.put("currentServingToken", prediction.getCurrentServingToken());
                posData.put("timestamp", prediction.getCalculatedAt());

                ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, posData, "Live position calculated");
                return;
            }

            enrichWithPrediction(token);
            ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, token, "Token retrieved");
            return;
        }

        ResponseUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid token request");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User currentUser = getAuthenticatedUser(req);
        if (currentUser == null) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required to generate token");
            return;
        }

        try {
            JsonObject json = parseJsonBody(req);
            String counterId = json.has("counterId") ? json.get("counterId").getAsString() : null;

            if (counterId == null || counterId.trim().isEmpty()) {
                ResponseUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Counter ID is required");
                return;
            }

            Token token = tokenService.generateToken(currentUser, counterId);
            enrichWithPrediction(token);

            ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_CREATED, token, "Token generated successfully");
        } catch (IllegalArgumentException | IllegalStateException e) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Token generation failed: " + e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User currentUser = getAuthenticatedUser(req);
        if (currentUser == null) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
            return;
        }

        String pathInfo = req.getPathInfo();
        if (pathInfo == null || pathInfo.length() <= 1) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Token ID required");
            return;
        }

        String tokenId = pathInfo.substring(1);
        try {
            boolean isAdminOrStaff = (currentUser.getRole() == User.Role.ADMIN || currentUser.getRole() == User.Role.STAFF);
            Token cancelled = tokenService.cancelToken(tokenId, currentUser.getId(), isAdminOrStaff);
            ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, cancelled, "Token cancelled successfully");
        } catch (IllegalArgumentException e) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, e.getMessage());
        } catch (IllegalAccessException e) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_FORBIDDEN, e.getMessage());
        } catch (IllegalStateException e) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to cancel token: " + e.getMessage());
        }
    }

    private void enrichWithPrediction(Token token) {
        if (token.getStatus() == Token.Status.WAITING) {
            QueuePrediction pred = predictionService.predictForToken(token);
            token.setQueuePosition(pred.getQueuePosition());
            token.setPeopleAhead(pred.getCustomersAhead());
            token.setEstimatedWaitMinutes(pred.getEstimatedWaitMinutes());
        }
    }

    private User getAuthenticatedUser(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        return session != null ? (User) session.getAttribute("user") : null;
    }

    private JsonObject parseJsonBody(HttpServletRequest req) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        return JsonUtil.fromJson(sb.toString(), JsonObject.class);
    }
}

package com.queueless.servlets;

import com.google.gson.JsonObject;
import com.queueless.dao.CounterDAO;
import com.queueless.dao.ServiceHistoryDAO;
import com.queueless.dao.TokenDAO;
import com.queueless.dao.UserDAO;
import com.queueless.models.Counter;
import com.queueless.models.ServiceHistory;
import com.queueless.models.Token;
import com.queueless.models.User;
import com.queueless.services.AuthService;
import com.queueless.utils.JsonUtil;
import com.queueless.utils.ResponseUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Servlet handling Administrator analytics, counter controls, and staff management.
 * Endpoints:
 * - GET  /api/admin/analytics
 * - GET  /api/admin/staff
 * - POST /api/admin/staff
 * - GET  /api/admin/counters
 * - GET  /api/admin/tokens
 */
@WebServlet(name = "AdminServlet", urlPatterns = {"/api/admin/*"})
public class AdminServlet extends HttpServlet {
    private final UserDAO userDAO = new UserDAO();
    private final CounterDAO counterDAO = new CounterDAO();
    private final TokenDAO tokenDAO = new TokenDAO();
    private final ServiceHistoryDAO serviceHistoryDAO = new ServiceHistoryDAO();
    private final AuthService authService = new AuthService(userDAO);

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User admin = getAdminUser(req);
        if (admin == null) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_FORBIDDEN, "Administrator privileges required");
            return;
        }

        String pathInfo = req.getPathInfo();
        if (pathInfo == null) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid endpoint");
            return;
        }

        switch (pathInfo) {
            case "/analytics":
                handleAnalytics(resp);
                break;
            case "/staff":
                handleListStaff(resp);
                break;
            case "/counters":
                handleListCounters(resp);
                break;
            case "/tokens":
                handleListTokens(resp);
                break;
            default:
                ResponseUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Admin endpoint not found");
                break;
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User admin = getAdminUser(req);
        if (admin == null) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_FORBIDDEN, "Administrator privileges required");
            return;
        }

        String pathInfo = req.getPathInfo();
        if ("/staff".equals(pathInfo)) {
            try {
                JsonObject json = parseJsonBody(req);
                String name = json.get("name").getAsString();
                String email = json.get("email").getAsString();
                String password = json.get("password").getAsString();
                String phone = json.has("phone") ? json.get("phone").getAsString() : "";

                User staff = authService.register(name, email, password, User.Role.STAFF, phone);
                ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_CREATED, sanitizeUser(staff), "Staff member created");
            } catch (Exception e) {
                ResponseUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
            }
        } else {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
        }
    }

    private void handleAnalytics(HttpServletResponse resp) throws IOException {
        long totalToday = tokenDAO.countTotalToday();
        long waitingNow = tokenDAO.countByStatus(Token.Status.WAITING);
        long servingNow = tokenDAO.countByStatus(Token.Status.SERVING);
        long completedNow = tokenDAO.countByStatus(Token.Status.COMPLETED);
        long cancelledNow = tokenDAO.countByStatus(Token.Status.CANCELLED);
        long activeCounters = counterDAO.countActive();
        double avgWaitMinutes = serviceHistoryDAO.getSystemAverageWaitMinutes();

        List<ServiceHistory> recentHistory = serviceHistoryDAO.getRecent(15);
        List<Counter> counters = counterDAO.findAll();

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalTokensToday", totalToday);
        analytics.put("waitingCount", waitingNow);
        analytics.put("servingCount", servingNow);
        analytics.put("completedCount", completedNow);
        analytics.put("cancelledCount", cancelledNow);
        analytics.put("activeCountersCount", activeCounters);
        analytics.put("averageWaitMinutes", Math.round(avgWaitMinutes * 10.0) / 10.0);
        analytics.put("recentHistory", recentHistory);
        analytics.put("counters", counters);

        ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, analytics, "System analytics retrieved");
    }

    private void handleListStaff(HttpServletResponse resp) throws IOException {
        List<User> staffMembers = userDAO.listByRole(User.Role.STAFF);
        List<User> sanitized = new ArrayList<>();
        for (User u : staffMembers) {
            sanitized.add(sanitizeUser(u));
        }
        ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, sanitized, "Staff members list");
    }

    private void handleListCounters(HttpServletResponse resp) throws IOException {
        List<Counter> counters = counterDAO.findAll();
        ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, counters, "Counters list");
    }

    private void handleListTokens(HttpServletResponse resp) throws IOException {
        List<Token> tokens = tokenDAO.findAllToday();
        ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, tokens, "Tokens list");
    }

    private User getAdminUser(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session == null) return null;
        User user = (User) session.getAttribute("user");
        return (user != null && user.getRole() == User.Role.ADMIN) ? user : null;
    }

    private User sanitizeUser(User user) {
        User safe = new User();
        safe.setId(user.getId());
        safe.setName(user.getName());
        safe.setEmail(user.getEmail());
        safe.setRole(user.getRole());
        safe.setPhone(user.getPhone());
        safe.setActive(user.isActive());
        safe.setCreatedAt(user.getCreatedAt());
        return safe;
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

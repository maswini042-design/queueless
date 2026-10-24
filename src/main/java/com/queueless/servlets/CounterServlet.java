package com.queueless.servlets;

import com.google.gson.JsonObject;
import com.queueless.dao.CounterDAO;
import com.queueless.dao.TokenDAO;
import com.queueless.models.Counter;
import com.queueless.models.Token;
import com.queueless.models.User;
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
 * Servlet handling service counter retrieval and configuration.
 * Endpoints:
 * - GET /api/counters
 * - GET /api/counters/{id}
 * - POST /api/counters (Admin)
 * - PUT /api/counters/{id} (Admin)
 * - DELETE /api/counters/{id} (Admin)
 */
@WebServlet(name = "CounterServlet", urlPatterns = {"/api/counters", "/api/counters/*"})
public class CounterServlet extends HttpServlet {
    private final CounterDAO counterDAO = new CounterDAO();
    private final TokenDAO tokenDAO = new TokenDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();

        if (pathInfo == null || "/".equals(pathInfo)) {
            // Return all counters enriched with live queue counts and currently serving token
            List<Counter> counters = counterDAO.findAll();
            List<Map<String, Object>> enriched = new ArrayList<>();

            for (Counter c : counters) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", c.getId());
                map.put("counterName", c.getCounterName());
                map.put("code", c.getCode());
                map.put("description", c.getDescription());
                map.put("averageServiceMinutes", c.getAverageServiceMinutes());
                map.put("staffId", c.getStaffId());
                map.put("staffName", c.getStaffName());
                map.put("status", c.getStatus().name());

                List<Token> waiting = tokenDAO.findWaitingByCounter(c.getId());
                map.put("waitingCount", waiting.size());

                Token serving = tokenDAO.findServingByCounter(c.getId());
                map.put("currentServingToken", serving != null ? serving.getTokenNumber() : "None");
                map.put("currentServingId", serving != null ? serving.getId() : null);

                enriched.add(map);
            }
            ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, enriched, "Counters retrieved");
        } else {
            String counterId = pathInfo.substring(1);
            Counter counter = counterDAO.findById(counterId);
            if (counter == null) {
                ResponseUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Counter not found");
                return;
            }
            ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, counter, "Counter details retrieved");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User currentUser = getAdminUser(req);
        if (currentUser == null) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_FORBIDDEN, "Admin privileges required");
            return;
        }

        try {
            JsonObject json = parseJsonBody(req);
            Counter counter = new Counter();
            counter.setCounterName(json.get("counterName").getAsString());
            counter.setCode(json.get("code").getAsString());
            counter.setDescription(json.has("description") ? json.get("description").getAsString() : "");
            counter.setAverageServiceMinutes(json.has("averageServiceMinutes") ? json.get("averageServiceMinutes").getAsInt() : 5);
            counter.setStaffId(json.has("staffId") ? json.get("staffId").getAsString() : "");
            counter.setStaffName(json.has("staffName") ? json.get("staffName").getAsString() : "");
            if (json.has("status")) {
                counter.setStatus(Counter.Status.valueOf(json.get("status").getAsString().toUpperCase()));
            }

            Counter created = counterDAO.create(counter);
            ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_CREATED, created, "Counter created successfully");
        } catch (Exception e) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to create counter: " + e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User currentUser = getAdminUser(req);
        if (currentUser == null) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_FORBIDDEN, "Admin privileges required");
            return;
        }

        String pathInfo = req.getPathInfo();
        if (pathInfo == null || pathInfo.length() <= 1) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Counter ID required");
            return;
        }

        String counterId = pathInfo.substring(1);
        Counter existing = counterDAO.findById(counterId);
        if (existing == null) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Counter not found");
            return;
        }

        try {
            JsonObject json = parseJsonBody(req);
            if (json.has("counterName")) existing.setCounterName(json.get("counterName").getAsString());
            if (json.has("code")) existing.setCode(json.get("code").getAsString());
            if (json.has("description")) existing.setDescription(json.get("description").getAsString());
            if (json.has("averageServiceMinutes")) existing.setAverageServiceMinutes(json.get("averageServiceMinutes").getAsInt());
            if (json.has("staffId")) existing.setStaffId(json.get("staffId").getAsString());
            if (json.has("staffName")) existing.setStaffName(json.get("staffName").getAsString());
            if (json.has("status")) existing.setStatus(Counter.Status.valueOf(json.get("status").getAsString().toUpperCase()));

            counterDAO.update(existing);
            ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, existing, "Counter updated successfully");
        } catch (Exception e) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Failed to update counter: " + e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User currentUser = getAdminUser(req);
        if (currentUser == null) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_FORBIDDEN, "Admin privileges required");
            return;
        }

        String pathInfo = req.getPathInfo();
        if (pathInfo == null || pathInfo.length() <= 1) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Counter ID required");
            return;
        }

        String counterId = pathInfo.substring(1);
        boolean deleted = counterDAO.delete(counterId);
        if (deleted) {
            ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, null, "Counter deleted");
        } else {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Counter not found");
        }
    }

    private User getAdminUser(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session == null) return null;
        User user = (User) session.getAttribute("user");
        return (user != null && user.getRole() == User.Role.ADMIN) ? user : null;
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

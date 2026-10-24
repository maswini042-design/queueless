package com.queueless.servlets;

import com.queueless.config.MongoConfig;
import com.queueless.utils.ResponseUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Health check endpoint reporting application, server runtime, and MongoDB connectivity status.
 * GET /api/health
 */
@WebServlet(name = "HealthServlet", urlPatterns = {"/api/health"})
public class HealthServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        boolean dbHealthy = MongoConfig.isHealthy();

        Map<String, Object> health = new HashMap<>();
        health.put("status", dbHealthy ? "UP" : "DEGRADED");
        health.put("application", "QueueLess — Smart Queue Prediction System");
        health.put("version", "1.0.0");
        health.put("runtime", "Apache Tomcat 10.1 / Java 26 (Jakarta Servlet 6.0)");
        health.put("database", MongoConfig.getActiveDatabaseName());
        health.put("databaseConnected", dbHealthy);
        health.put("timestamp", System.currentTimeMillis());

        if (!dbHealthy && MongoConfig.getLastError() != null) {
            health.put("databaseError", MongoConfig.getLastError());
        }

        int statusCode = dbHealthy ? HttpServletResponse.SC_OK : HttpServletResponse.SC_SERVICE_UNAVAILABLE;
        ResponseUtil.sendSuccess(resp, statusCode, health, dbHealthy ? "System healthy" : "Database connection warning");
    }
}

package com.queueless.utils;

import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

/**
 * Standardized HTTP response helper ensuring consistent JSON envelope across all endpoints.
 */
public class ResponseUtil {

    public static void sendSuccess(HttpServletResponse response, int statusCode, Object data, String message) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(statusCode);

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("message", message);
        body.put("data", data);
        body.put("timestamp", System.currentTimeMillis());

        try (PrintWriter out = response.getWriter()) {
            out.print(JsonUtil.toJson(body));
            out.flush();
        }
    }

    public static void sendError(HttpServletResponse response, int statusCode, String message) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(statusCode);

        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("error", message);
        body.put("timestamp", System.currentTimeMillis());

        try (PrintWriter out = response.getWriter()) {
            out.print(JsonUtil.toJson(body));
            out.flush();
        }
    }
}

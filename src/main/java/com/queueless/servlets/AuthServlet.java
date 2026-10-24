package com.queueless.servlets;

import com.google.gson.JsonObject;
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

/**
 * Authentication Servlet managing multi-role login experiences, user registration,
 * session renewal (session fixation protection), and session inspection.
 *
 * Endpoints:
 * - POST /api/auth/register (Registers standard USER role only)
 * - POST /api/auth/login    (Authenticates with optional portal role verification)
 * - POST /api/auth/logout   (Destroys session)
 * - GET  /api/auth/me       (Returns active authenticated user profile)
 */
@WebServlet(name = "AuthServlet", urlPatterns = {"/api/auth/*"})
public class AuthServlet extends HttpServlet {
    private final AuthService authService = new AuthService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();
        if ("/me".equals(pathInfo)) {
            handleMe(req, resp);
        } else {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Resource not found");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();
        if (pathInfo == null) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid endpoint");
            return;
        }

        switch (pathInfo) {
            case "/register":
                handleRegister(req, resp);
                break;
            case "/login":
                handleLogin(req, resp);
                break;
            case "/logout":
                handleLogout(req, resp);
                break;
            default:
                ResponseUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
                break;
        }
    }

    /**
     * User Registration:
     * Critical Security Rule: Public registration is strictly locked to User.Role.USER.
     * Any requested role in client JSON is ignored.
     */
    private void handleRegister(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            JsonObject json = parseJsonBody(req);
            String name = json.has("name") ? json.get("name").getAsString() : null;
            String email = json.has("email") ? json.get("email").getAsString() : null;
            String password = json.has("password") ? json.get("password").getAsString() : null;
            String phone = json.has("phone") ? json.get("phone").getAsString() : "";

            // Strictly create USER role
            User user = authService.registerUser(name, email, password, phone);

            // Invalidate any existing session and issue a fresh session
            HttpSession oldSession = req.getSession(false);
            if (oldSession != null) {
                oldSession.invalidate();
            }
            HttpSession newSession = req.getSession(true);
            newSession.setAttribute("user", user);

            ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_CREATED, sanitizeUser(user), "User account registered successfully.");
        } catch (IllegalArgumentException e) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Registration failed: " + e.getMessage());
        }
    }

    /**
     * Multi-Role Login Handler:
     * Supports dedicated portals: 'admin', 'staff', 'user'.
     * Regenerates session ID to prevent session fixation.
     */
    private void handleLogin(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            JsonObject json = parseJsonBody(req);
            String email = json.has("email") ? json.get("email").getAsString() : null;
            String password = json.has("password") ? json.get("password").getAsString() : null;
            String portalRole = json.has("portal") ? json.get("portal").getAsString() : null;

            User user = authService.authenticate(email, password, portalRole);

            // Protect against session fixation: invalidate old session and start fresh
            HttpSession oldSession = req.getSession(false);
            if (oldSession != null) {
                oldSession.invalidate();
            }
            HttpSession session = req.getSession(true);
            session.setAttribute("user", user);

            ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, sanitizeUser(user), "Authenticated successfully as " + user.getRole().name());
        } catch (IllegalArgumentException e) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, e.getMessage());
        } catch (IllegalStateException e) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_FORBIDDEN, e.getMessage());
        } catch (Exception e) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Login processing error: " + e.getMessage());
        }
    }

    private void handleLogout(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession(false);
        if (session != null) {
            session.removeAttribute("user");
            session.invalidate();
        }
        ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, null, "Logged out successfully");
    }

    private void handleMe(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession(false);
        User user = session != null ? (User) session.getAttribute("user") : null;

        if (user == null) {
            ResponseUtil.sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "No active session. Please log in.");
            return;
        }

        // Refresh user status from DB to ensure account wasn't deactivated
        User freshUser = authService.getUserById(user.getId());
        if (freshUser == null || !freshUser.isActive()) {
            if (session != null) session.invalidate();
            ResponseUtil.sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Session expired or account deactivated.");
            return;
        }

        ResponseUtil.sendSuccess(resp, HttpServletResponse.SC_OK, sanitizeUser(freshUser), "Session authenticated.");
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
}

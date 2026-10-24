package com.queueless.filters;

import com.queueless.models.User;
import com.queueless.utils.ResponseUtil;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

/**
 * Filter enforcing server-side session authentication and Role-Based Access Control (RBAC).
 * Guards /api/staff/* and /api/admin/* routes.
 */
@WebFilter(urlPatterns = {"/api/staff/*", "/api/admin/*"})
public class AuthFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        HttpSession session = req.getSession(false);
        User currentUser = session != null ? (User) session.getAttribute("user") : null;

        if (currentUser == null) {
            ResponseUtil.sendError(res, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required. Please log in.");
            return;
        }

        String path = req.getRequestURI();

        // RBAC: Admin endpoints require ADMIN role
        if (path.contains("/api/admin/") && currentUser.getRole() != User.Role.ADMIN) {
            ResponseUtil.sendError(res, HttpServletResponse.SC_FORBIDDEN, "Access denied: Administrator privileges required.");
            return;
        }

        // RBAC: Staff endpoints require STAFF or ADMIN role
        if (path.contains("/api/staff/") &&
                currentUser.getRole() != User.Role.STAFF &&
                currentUser.getRole() != User.Role.ADMIN) {
            ResponseUtil.sendError(res, HttpServletResponse.SC_FORBIDDEN, "Access denied: Staff privileges required.");
            return;
        }

        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {}
}

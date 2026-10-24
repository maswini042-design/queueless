package com.queueless.services;

import com.queueless.dao.UserDAO;
import com.queueless.models.User;
import org.mindrot.jbcrypt.BCrypt;

/**
 * Service managing user authentication, password hashing with BCrypt, role validation,
 * and bootstrap seeding of default accounts.
 */
public class AuthService {
    private final UserDAO userDAO;

    public AuthService() {
        this.userDAO = new UserDAO();
    }

    public AuthService(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    /**
     * Public user registration. Strictly enforces Role.USER.
     */
    public User registerUser(String name, String email, String password, String phone) throws Exception {
        return register(name, email, password, User.Role.USER, phone);
    }

    /**
     * Internal registration supporting role assignment (e.g., admin provisioning staff).
     */
    public User register(String name, String email, String password, User.Role role, String phone) throws Exception {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Full name is required.");
        }
        if (email == null || !email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("Valid email address is required.");
        }
        if (password == null || password.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters.");
        }

        String normalizedEmail = email.trim().toLowerCase();
        User existing = userDAO.findByEmail(normalizedEmail);
        if (existing != null) {
            throw new IllegalArgumentException("An account with this email address already exists.");
        }

        String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt(12));

        User user = new User();
        user.setName(name.trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(hashedPassword);
        user.setRole(role != null ? role : User.Role.USER);
        user.setPhone(phone != null ? phone.trim() : "");
        user.setActive(true);

        return userDAO.create(user);
    }

    /**
     * Authenticate user credentials with optional portal role validation.
     */
    public User authenticate(String email, String password) throws Exception {
        return authenticate(email, password, null);
    }

    public User authenticate(String email, String password, String expectedPortalRole) throws Exception {
        if (email == null || password == null || email.trim().isEmpty() || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Email and password are required.");
        }

        String normalizedEmail = email.trim().toLowerCase();
        User user = userDAO.findByEmail(normalizedEmail);
        if (user == null) {
            throw new IllegalArgumentException("Invalid email address or password.");
        }

        if (!user.isActive()) {
            throw new IllegalStateException("Your account has been deactivated. Please contact an administrator.");
        }

        boolean matched = false;
        try {
            matched = BCrypt.checkpw(password, user.getPasswordHash());
        } catch (Exception ex) {
            matched = false;
        }

        if (!matched) {
            throw new IllegalArgumentException("Invalid email address or password.");
        }

        // Role verification for portal-specific login
        if (expectedPortalRole != null && !expectedPortalRole.trim().isEmpty()) {
            String roleUpper = expectedPortalRole.trim().toUpperCase();
            if ("ADMIN".equals(roleUpper) && !user.isAdmin()) {
                throw new IllegalStateException("Access denied: You do not have administrator permissions.");
            }
            if ("STAFF".equals(roleUpper) && !user.isStaff() && !user.isAdmin()) {
                throw new IllegalStateException("Access denied: You do not have staff member access.");
            }
        }

        return user;
    }

    public User getUserById(String id) {
        return userDAO.findById(id);
    }

    public User getUserByEmail(String email) {
        return userDAO.findByEmail(email);
    }
}

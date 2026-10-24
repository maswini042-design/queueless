package com.queueless.dao;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Updates;
import com.queueless.config.MongoConfig;
import com.queueless.models.User;
import org.bson.Document;
import org.bson.types.ObjectId;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Data Access Object for MongoDB 'users' collection.
 */
public class UserDAO {
    private static final String COLLECTION_NAME = "users";

    private MongoCollection<Document> getCollection() {
        return MongoConfig.getCollection(COLLECTION_NAME);
    }

    public User findByEmail(String email) {
        if (email == null) return null;
        Document doc = getCollection().find(Filters.eq("email", email.trim().toLowerCase())).first();
        return docToUser(doc);
    }

    public User findById(String id) {
        if (id == null) return null;
        try {
            Document doc = getCollection().find(Filters.eq("_id", new ObjectId(id))).first();
            return docToUser(doc);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    public User create(User user) {
        Document doc = new Document()
                .append("name", user.getName())
                .append("email", user.getEmail().trim().toLowerCase())
                .append("passwordHash", user.getPasswordHash())
                .append("role", user.getRole().name())
                .append("phone", user.getPhone() != null ? user.getPhone() : "")
                .append("active", user.isActive())
                .append("createdAt", new Date())
                .append("updatedAt", new Date());

        getCollection().insertOne(doc);
        user.setId(doc.getObjectId("_id").toHexString());
        return user;
    }

    public boolean update(User user) {
        if (user.getId() == null) return false;
        var res = getCollection().updateOne(
                Filters.eq("_id", new ObjectId(user.getId())),
                Updates.combine(
                        Updates.set("name", user.getName()),
                        Updates.set("phone", user.getPhone()),
                        Updates.set("role", user.getRole().name()),
                        Updates.set("active", user.isActive()),
                        Updates.set("updatedAt", new Date())
                )
        );
        return res.getModifiedCount() > 0;
    }

    public List<User> listByRole(User.Role role) {
        List<User> list = new ArrayList<>();
        for (Document doc : getCollection().find(Filters.eq("role", role.name()))) {
            list.add(docToUser(doc));
        }
        return list;
    }

    public List<User> listAll() {
        List<User> list = new ArrayList<>();
        for (Document doc : getCollection().find()) {
            list.add(docToUser(doc));
        }
        return list;
    }

    public long count() {
        return getCollection().countDocuments();
    }

    private User docToUser(Document doc) {
        if (doc == null) return null;
        User user = new User();
        user.setId(doc.getObjectId("_id").toHexString());
        user.setName(doc.getString("name"));
        user.setEmail(doc.getString("email"));
        user.setPasswordHash(doc.getString("passwordHash"));
        String roleStr = doc.getString("role");
        user.setRole(roleStr != null ? User.Role.valueOf(roleStr) : User.Role.STUDENT);
        user.setPhone(doc.getString("phone"));
        Boolean active = doc.getBoolean("active");
        user.setActive(active == null || active);
        user.setCreatedAt(doc.getDate("createdAt"));
        user.setUpdatedAt(doc.getDate("updatedAt"));
        return user;
    }
}

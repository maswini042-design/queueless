package com.queueless.dao;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Sorts;
import com.mongodb.client.model.Updates;
import com.queueless.config.MongoConfig;
import com.queueless.models.Counter;
import org.bson.Document;
import org.bson.types.ObjectId;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Data Access Object for MongoDB 'counters' collection.
 */
public class CounterDAO {
    private static final String COLLECTION_NAME = "counters";

    private MongoCollection<Document> getCollection() {
        return MongoConfig.getCollection(COLLECTION_NAME);
    }

    public List<Counter> findAll() {
        List<Counter> list = new ArrayList<>();
        for (Document doc : getCollection().find().sort(Sorts.ascending("counterName"))) {
            list.add(docToCounter(doc));
        }
        return list;
    }

    public List<Counter> findActive() {
        List<Counter> list = new ArrayList<>();
        for (Document doc : getCollection().find(Filters.eq("status", "ACTIVE")).sort(Sorts.ascending("counterName"))) {
            list.add(docToCounter(doc));
        }
        return list;
    }

    public Counter findById(String id) {
        if (id == null) return null;
        try {
            Document doc = getCollection().find(Filters.eq("_id", new ObjectId(id))).first();
            return docToCounter(doc);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    public Counter findByStaffId(String staffId) {
        if (staffId == null) return null;
        Document doc = getCollection().find(Filters.eq("staffId", staffId)).first();
        return docToCounter(doc);
    }

    public Counter create(Counter counter) {
        Document doc = new Document()
                .append("counterName", counter.getCounterName())
                .append("code", counter.getCode() != null ? counter.getCode().toUpperCase() : "CTR")
                .append("description", counter.getDescription() != null ? counter.getDescription() : "")
                .append("averageServiceMinutes", Math.max(1, counter.getAverageServiceMinutes()))
                .append("staffId", counter.getStaffId() != null ? counter.getStaffId() : "")
                .append("staffName", counter.getStaffName() != null ? counter.getStaffName() : "Unassigned")
                .append("status", counter.getStatus() != null ? counter.getStatus().name() : "ACTIVE")
                .append("createdAt", new Date())
                .append("updatedAt", new Date());

        getCollection().insertOne(doc);
        counter.setId(doc.getObjectId("_id").toHexString());
        return counter;
    }

    public boolean update(Counter counter) {
        if (counter.getId() == null) return false;
        var res = getCollection().updateOne(
                Filters.eq("_id", new ObjectId(counter.getId())),
                Updates.combine(
                        Updates.set("counterName", counter.getCounterName()),
                        Updates.set("code", counter.getCode()),
                        Updates.set("description", counter.getDescription()),
                        Updates.set("averageServiceMinutes", counter.getAverageServiceMinutes()),
                        Updates.set("staffId", counter.getStaffId()),
                        Updates.set("staffName", counter.getStaffName()),
                        Updates.set("status", counter.getStatus().name()),
                        Updates.set("updatedAt", new Date())
                )
        );
        return res.getModifiedCount() > 0;
    }

    public boolean delete(String id) {
        if (id == null) return false;
        try {
            var res = getCollection().deleteOne(Filters.eq("_id", new ObjectId(id)));
            return res.getDeletedCount() > 0;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    public long countActive() {
        return getCollection().countDocuments(Filters.eq("status", "ACTIVE"));
    }

    private Counter docToCounter(Document doc) {
        if (doc == null) return null;
        Counter c = new Counter();
        c.setId(doc.getObjectId("_id").toHexString());
        c.setCounterName(doc.getString("counterName"));
        c.setCode(doc.getString("code"));
        c.setDescription(doc.getString("description"));
        Integer avg = doc.getInteger("averageServiceMinutes");
        c.setAverageServiceMinutes(avg != null ? avg : 5);
        c.setStaffId(doc.getString("staffId"));
        c.setStaffName(doc.getString("staffName"));
        String statusStr = doc.getString("status");
        c.setStatus(statusStr != null ? Counter.Status.valueOf(statusStr) : Counter.Status.ACTIVE);
        c.setCreatedAt(doc.getDate("createdAt"));
        c.setUpdatedAt(doc.getDate("updatedAt"));
        return c;
    }
}

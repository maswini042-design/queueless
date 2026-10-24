package com.queueless.dao;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.FindOneAndUpdateOptions;
import com.mongodb.client.model.ReturnDocument;
import com.mongodb.client.model.Sorts;
import com.mongodb.client.model.Updates;
import com.queueless.config.MongoConfig;
import com.queueless.models.Token;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

/**
 * Data Access Object for MongoDB 'tokens' collection.
 * Concurrency-safe atomic token sequence generator using settings collection.
 */
public class TokenDAO {
    private static final String COLLECTION_NAME = "tokens";
    private static final String SEQUENCES_COLLECTION = "settings";

    private MongoCollection<Document> getCollection() {
        return MongoConfig.getCollection(COLLECTION_NAME);
    }

    private MongoCollection<Document> getSequencesCollection() {
        return MongoConfig.getCollection(SEQUENCES_COLLECTION);
    }

    /**
     * Atomically increments and retrieves the next sequential number for a counter code for today.
     * Guaranteed safe for concurrent requests in multi-threaded Tomcat.
     */
    public synchronized int getNextSequenceNumber(String counterCode) {
        String seqKey = "seq_" + (counterCode != null ? counterCode.toUpperCase() : "CTR");
        Bson filter = Filters.eq("settingName", seqKey);
        Bson update = Updates.inc("settingValue", 1);
        FindOneAndUpdateOptions options = new FindOneAndUpdateOptions().upsert(true).returnDocument(ReturnDocument.AFTER);

        Document updated = getSequencesCollection().findOneAndUpdate(filter, update, options);
        if (updated != null) {
            Number val = updated.get("settingValue", Number.class);
            return val != null ? val.intValue() : 101;
        }
        return 101;
    }

    public Token create(Token token) {
        Document doc = new Document()
                .append("tokenNumber", token.getTokenNumber())
                .append("sequenceNumber", token.getSequenceNumber())
                .append("userId", token.getUserId())
                .append("userName", token.getUserName())
                .append("userEmail", token.getUserEmail())
                .append("userPhone", token.getUserPhone() != null ? token.getUserPhone() : "")
                .append("counterId", token.getCounterId())
                .append("counterName", token.getCounterName())
                .append("status", token.getStatus().name())
                .append("estimatedWaitMinutes", token.getEstimatedWaitMinutes())
                .append("createdAt", token.getCreatedAt() != null ? token.getCreatedAt() : new Date());

        getCollection().insertOne(doc);
        token.setId(doc.getObjectId("_id").toHexString());
        return token;
    }

    public Token findById(String id) {
        if (id == null) return null;
        try {
            Document doc = getCollection().find(Filters.eq("_id", new ObjectId(id))).first();
            return docToToken(doc);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    public Token findActiveByUser(String userId) {
        if (userId == null) return null;
        Bson filter = Filters.and(
                Filters.eq("userId", userId),
                Filters.in("status", Token.Status.WAITING.name(), Token.Status.CALLED.name(), Token.Status.SERVING.name())
        );
        Document doc = getCollection().find(filter).sort(Sorts.descending("createdAt")).first();
        return docToToken(doc);
    }

    public Token findActiveByUserAndCounter(String userId, String counterId) {
        if (userId == null || counterId == null) return null;
        Bson filter = Filters.and(
                Filters.eq("userId", userId),
                Filters.eq("counterId", counterId),
                Filters.in("status", Token.Status.WAITING.name(), Token.Status.CALLED.name(), Token.Status.SERVING.name())
        );
        Document doc = getCollection().find(filter).first();
        return docToToken(doc);
    }

    public List<Token> findWaitingByCounter(String counterId) {
        List<Token> list = new ArrayList<>();
        Bson filter = Filters.and(
                Filters.eq("counterId", counterId),
                Filters.eq("status", Token.Status.WAITING.name())
        );
        for (Document doc : getCollection().find(filter).sort(Sorts.ascending("createdAt"))) {
            list.add(docToToken(doc));
        }
        return list;
    }

    public Token findServingByCounter(String counterId) {
        Bson filter = Filters.and(
                Filters.eq("counterId", counterId),
                Filters.eq("status", Token.Status.SERVING.name())
        );
        Document doc = getCollection().find(filter).first();
        return docToToken(doc);
    }

    public Token findCalledByCounter(String counterId) {
        Bson filter = Filters.and(
                Filters.eq("counterId", counterId),
                Filters.eq("status", Token.Status.CALLED.name())
        );
        Document doc = getCollection().find(filter).first();
        return docToToken(doc);
    }

    public List<Token> findMyTokens(String userId) {
        List<Token> list = new ArrayList<>();
        if (userId == null) return list;
        for (Document doc : getCollection().find(Filters.eq("userId", userId)).sort(Sorts.descending("createdAt")).limit(50)) {
            list.add(docToToken(doc));
        }
        return list;
    }

    public int countWaitingAhead(String counterId, Date createdAt) {
        if (counterId == null || createdAt == null) return 0;
        Bson filter = Filters.and(
                Filters.eq("counterId", counterId),
                Filters.eq("status", Token.Status.WAITING.name()),
                Filters.lt("createdAt", createdAt)
        );
        return (int) getCollection().countDocuments(filter);
    }

    public boolean updateStatus(String tokenId, Token.Status newStatus, Date timestamp) {
        if (tokenId == null || newStatus == null) return false;
        try {
            List<Bson> updates = new ArrayList<>();
            updates.add(Updates.set("status", newStatus.name()));

            Date ts = timestamp != null ? timestamp : new Date();
            if (newStatus == Token.Status.CALLED) {
                updates.add(Updates.set("calledAt", ts));
            } else if (newStatus == Token.Status.SERVING) {
                updates.add(Updates.set("serviceStartedAt", ts));
            } else if (newStatus == Token.Status.COMPLETED) {
                updates.add(Updates.set("completedAt", ts));
            } else if (newStatus == Token.Status.CANCELLED) {
                updates.add(Updates.set("cancelledAt", ts));
            }

            var res = getCollection().updateOne(
                    Filters.eq("_id", new ObjectId(tokenId)),
                    Updates.combine(updates)
            );
            return res.getModifiedCount() > 0;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    public List<Token> findAllToday() {
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        Date startOfDay = cal.getTime();

        List<Token> list = new ArrayList<>();
        for (Document doc : getCollection().find(Filters.gte("createdAt", startOfDay)).sort(Sorts.descending("createdAt"))) {
            list.add(docToToken(doc));
        }
        return list;
    }

    public long countByStatus(Token.Status status) {
        return getCollection().countDocuments(Filters.eq("status", status.name()));
    }

    public long countTotalToday() {
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        return getCollection().countDocuments(Filters.gte("createdAt", cal.getTime()));
    }

    private Token docToToken(Document doc) {
        if (doc == null) return null;
        Token t = new Token();
        t.setId(doc.getObjectId("_id").toHexString());
        t.setTokenNumber(doc.getString("tokenNumber"));
        Integer seq = doc.getInteger("sequenceNumber");
        t.setSequenceNumber(seq != null ? seq : 0);
        t.setUserId(doc.getString("userId"));
        t.setUserName(doc.getString("userName"));
        t.setUserEmail(doc.getString("userEmail"));
        t.setUserPhone(doc.getString("userPhone"));
        t.setCounterId(doc.getString("counterId"));
        t.setCounterName(doc.getString("counterName"));
        String st = doc.getString("status");
        t.setStatus(st != null ? Token.Status.valueOf(st) : Token.Status.WAITING);
        t.setCreatedAt(doc.getDate("createdAt"));
        t.setCalledAt(doc.getDate("calledAt"));
        t.setServiceStartedAt(doc.getDate("serviceStartedAt"));
        t.setCompletedAt(doc.getDate("completedAt"));
        t.setCancelledAt(doc.getDate("cancelledAt"));
        Integer est = doc.getInteger("estimatedWaitMinutes");
        t.setEstimatedWaitMinutes(est != null ? est : 0);
        return t;
    }
}

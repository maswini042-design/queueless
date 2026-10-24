package com.queueless.dao;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Accumulators;
import com.mongodb.client.model.Aggregates;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Sorts;
import com.queueless.config.MongoConfig;
import com.queueless.models.ServiceHistory;
import org.bson.Document;
import org.bson.types.ObjectId;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

/**
 * Data Access Object for MongoDB 'serviceHistory' collection.
 * Powers the smart queue prediction algorithm and admin analytics.
 */
public class ServiceHistoryDAO {
    private static final String COLLECTION_NAME = "serviceHistory";

    private MongoCollection<Document> getCollection() {
        return MongoConfig.getCollection(COLLECTION_NAME);
    }

    public void recordService(ServiceHistory history) {
        Document doc = new Document()
                .append("tokenId", history.getTokenId())
                .append("tokenNumber", history.getTokenNumber())
                .append("counterId", history.getCounterId())
                .append("counterName", history.getCounterName())
                .append("staffId", history.getStaffId())
                .append("staffName", history.getStaffName())
                .append("serviceDurationSeconds", history.getServiceDurationSeconds())
                .append("waitingDurationSeconds", history.getWaitingDurationSeconds())
                .append("completedAt", history.getCompletedAt() != null ? history.getCompletedAt() : new Date());

        getCollection().insertOne(doc);
        history.setId(doc.getObjectId("_id").toHexString());
    }

    public List<ServiceHistory> getRecent(int limit) {
        List<ServiceHistory> list = new ArrayList<>();
        for (Document doc : getCollection().find().sort(Sorts.descending("completedAt")).limit(limit)) {
            list.add(docToHistory(doc));
        }
        return list;
    }

    /**
     * Calculates rolling average service time (in seconds) for a specific counter.
     * Uses MongoDB aggregation pipeline over the most recent 30 completed services.
     */
    public double getAverageServiceTimeSeconds(String counterId) {
        if (counterId == null) return 300.0; // default 5 minutes
        try {
            var pipeline = Arrays.asList(
                    Aggregates.match(Filters.eq("counterId", counterId)),
                    Aggregates.sort(Sorts.descending("completedAt")),
                    Aggregates.limit(30),
                    Aggregates.group(null, Accumulators.avg("avgDuration", "$serviceDurationSeconds"))
            );

            Document result = getCollection().aggregate(pipeline).first();
            if (result != null && result.containsKey("avgDuration")) {
                Number avg = result.get("avgDuration", Number.class);
                if (avg != null && avg.doubleValue() > 30) {
                    return avg.doubleValue();
                }
            }
        } catch (Exception ignored) {}
        return 300.0; // fallback to 5 minutes
    }

    /**
     * System-wide average wait time in minutes.
     */
    public double getSystemAverageWaitMinutes() {
        try {
            var pipeline = Arrays.asList(
                    Aggregates.sort(Sorts.descending("completedAt")),
                    Aggregates.limit(100),
                    Aggregates.group(null, Accumulators.avg("avgWait", "$waitingDurationSeconds"))
            );
            Document result = getCollection().aggregate(pipeline).first();
            if (result != null && result.containsKey("avgWait")) {
                Number avg = result.get("avgWait", Number.class);
                if (avg != null) {
                    return avg.doubleValue() / 60.0;
                }
            }
        } catch (Exception ignored) {}
        return 8.5; // default reasonable estimate
    }

    private ServiceHistory docToHistory(Document doc) {
        if (doc == null) return null;
        ServiceHistory h = new ServiceHistory();
        h.setId(doc.getObjectId("_id").toHexString());
        h.setTokenId(doc.getString("tokenId"));
        h.setTokenNumber(doc.getString("tokenNumber"));
        h.setCounterId(doc.getString("counterId"));
        h.setCounterName(doc.getString("counterName"));
        h.setStaffId(doc.getString("staffId"));
        h.setStaffName(doc.getString("staffName"));
        Number sDur = doc.get("serviceDurationSeconds", Number.class);
        h.setServiceDurationSeconds(sDur != null ? sDur.longValue() : 0);
        Number wDur = doc.get("waitingDurationSeconds", Number.class);
        h.setWaitingDurationSeconds(wDur != null ? wDur.longValue() : 0);
        h.setCompletedAt(doc.getDate("completedAt"));
        return h;
    }
}

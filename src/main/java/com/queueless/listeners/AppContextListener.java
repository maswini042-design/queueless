package com.queueless.listeners;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.IndexOptions;
import com.mongodb.client.model.Indexes;
import com.queueless.config.MongoConfig;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * ServletContextListener that initializes the MongoDB client pool and verifies collections/indexes
 * upon Tomcat application startup, and shuts down resources upon context destruction.
 */
@WebListener
public class AppContextListener implements ServletContextListener {
    private static final Logger logger = LoggerFactory.getLogger(AppContextListener.class);

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        logger.info("=====================================================");
        logger.info("Initializing QueueLess — Smart Queue Prediction System");
        logger.info("Target Environment: Apache Tomcat 10.1 / Java 26");
        logger.info("=====================================================");

        try {
            MongoConfig.init();
            if (MongoConfig.isHealthy()) {
                logger.info("Database connection validated. Ensuring required MongoDB indexes...");
                ensureDatabaseIndexes();
            } else {
                logger.warn("Database connection could not be established at startup. Verify MONGODB_URI.");
            }
        } catch (Exception ex) {
            logger.error("Error during AppContextListener initialization: {}", ex.getMessage(), ex);
        }
    }

    private void ensureDatabaseIndexes() {
        try {
            // users collection: unique index on email
            MongoCollection<Document> users = MongoConfig.getCollection("users");
            users.createIndex(Indexes.ascending("email"), new IndexOptions().unique(true));

            // tokens collection: indexes on counterId, status, userId, and tokenNumber
            MongoCollection<Document> tokens = MongoConfig.getCollection("tokens");
            tokens.createIndex(Indexes.compoundIndex(
                    Indexes.ascending("counterId"),
                    Indexes.ascending("status"),
                    Indexes.ascending("createdAt")
            ));
            tokens.createIndex(Indexes.compoundIndex(
                    Indexes.ascending("userId"),
                    Indexes.ascending("status")
            ));
            tokens.createIndex(Indexes.ascending("tokenNumber"));

            // counters collection: index on status
            MongoCollection<Document> counters = MongoConfig.getCollection("counters");
            counters.createIndex(Indexes.ascending("status"));

            // serviceHistory collection: index on counterId, completedAt
            MongoCollection<Document> history = MongoConfig.getCollection("serviceHistory");
            history.createIndex(Indexes.compoundIndex(
                    Indexes.ascending("counterId"),
                    Indexes.descending("completedAt")
            ));

            logger.info("Successfully established indexes for collections: users, tokens, counters, serviceHistory.");
        } catch (Exception ex) {
            logger.warn("Could not complete automatic index creation (check database privileges): {}", ex.getMessage());
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        logger.info("Destroying QueueLess application context in Tomcat...");
        MongoConfig.close();
        logger.info("QueueLess context destroyed cleanly.");
    }
}

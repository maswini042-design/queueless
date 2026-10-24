package com.queueless.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.MongoException;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.TimeUnit;

/**
 * Thread-safe singleton configuration manager for MongoDB.
 * Connects to MongoDB Atlas or local MongoDB using the official MongoDB Java Synchronous Driver 5.5.1.
 * Safely sanitizes URIs in logs to prevent credential leakage.
 */
public class MongoConfig {
    private static final Logger logger = LoggerFactory.getLogger(MongoConfig.class);

    private static final String DEFAULT_DATABASE_NAME = "queueless_db";
    private static final String DEFAULT_LOCAL_URI = "mongodb://localhost:27017";

    private static volatile MongoClient mongoClient = null;
    private static volatile MongoDatabase mongoDatabase = null;
    private static volatile String activeDatabaseName = DEFAULT_DATABASE_NAME;
    private static volatile boolean isConnected = false;
    private static volatile String lastError = null;

    private MongoConfig() {
        // Utility singleton class
    }

    /**
     * Initializes the MongoDB connection pooling and connects to the specified database.
     */
    public static synchronized void init() {
        if (mongoClient != null) {
            logger.info("MongoDB client is already initialized.");
            return;
        }

        String rawUri = System.getenv("MONGODB_URI");
        if (rawUri == null || rawUri.trim().isEmpty()) {
            rawUri = System.getProperty("MONGODB_URI");
        }
        if (rawUri == null || rawUri.trim().isEmpty()) {
            logger.warn("MONGODB_URI environment variable is not defined. Defaulting to local: {}", DEFAULT_LOCAL_URI);
            rawUri = DEFAULT_LOCAL_URI;
        }

        String dbName = System.getenv("MONGODB_DATABASE");
        if (dbName == null || dbName.trim().isEmpty()) {
            dbName = System.getProperty("MONGODB_DATABASE");
        }
        if (dbName == null || dbName.trim().isEmpty()) {
            dbName = DEFAULT_DATABASE_NAME;
        }
        activeDatabaseName = dbName.trim();

        String maskedUri = maskConnectionString(rawUri);
        logger.info("Initializing MongoDB Client with target: {}", maskedUri);

        try {
            ConnectionString connectionString = new ConnectionString(rawUri);
            MongoClientSettings settings = MongoClientSettings.builder()
                    .applyConnectionString(connectionString)
                    .applyToSocketSettings(builder ->
                            builder.connectTimeout(5000, TimeUnit.MILLISECONDS)
                                   .readTimeout(10000, TimeUnit.MILLISECONDS))
                    .applyToConnectionPoolSettings(builder ->
                            builder.maxSize(50)
                                   .minSize(5)
                                   .maxWaitTime(5000, TimeUnit.MILLISECONDS))
                    .build();

            mongoClient = MongoClients.create(settings);
            mongoDatabase = mongoClient.getDatabase(activeDatabaseName);

            // Execute ping command to test real connectivity
            Document pingResult = mongoDatabase.runCommand(new Document("ping", 1));
            isConnected = pingResult.containsKey("ok");
            lastError = null;
            logger.info("Successfully established connection to MongoDB database [{}]", activeDatabaseName);
        } catch (MongoException | IllegalArgumentException ex) {
            isConnected = false;
            lastError = ex.getMessage();
            logger.error("Failed to establish connection to MongoDB: {}", ex.getMessage());
        }
    }

    /**
     * Retrieves the active MongoDatabase instance.
     * Re-attempts connection if not currently established.
     */
    public static MongoDatabase getDatabase() {
        if (mongoClient == null || mongoDatabase == null) {
            init();
        }
        return mongoDatabase;
    }

    /**
     * Retrieves a named collection from the active MongoDB database.
     */
    public static MongoCollection<Document> getCollection(String collectionName) {
        MongoDatabase db = getDatabase();
        if (db == null) {
            throw new IllegalStateException("MongoDB database is not available. Check MONGODB_URI configuration.");
        }
        return db.getCollection(collectionName);
    }

    /**
     * Checks whether MongoDB is currently reachable.
     */
    public static boolean isHealthy() {
        if (mongoClient == null || mongoDatabase == null) {
            return false;
        }
        try {
            Document ping = mongoDatabase.runCommand(new Document("ping", 1));
            return ping != null && (ping.getDouble("ok") != null && ping.getDouble("ok") == 1.0 || ping.getInteger("ok", 0) == 1);
        } catch (Exception ex) {
            lastError = ex.getMessage();
            return false;
        }
    }

    public static String getActiveDatabaseName() {
        return activeDatabaseName;
    }

    public static String getLastError() {
        return lastError;
    }

    /**
     * Gracefully closes the MongoClient instance on Tomcat application shutdown.
     */
    public static synchronized void close() {
        if (mongoClient != null) {
            try {
                logger.info("Closing MongoDB client connection pool...");
                mongoClient.close();
                logger.info("MongoDB client shut down successfully.");
            } catch (Exception ex) {
                logger.error("Error occurred while closing MongoDB client: {}", ex.getMessage());
            } finally {
                mongoClient = null;
                mongoDatabase = null;
                isConnected = false;
            }
        }
    }

    /**
     * Utility method to mask passwords inside connection strings for security.
     */
    public static String maskConnectionString(String uri) {
        if (uri == null) return "null";
        return uri.replaceAll("(?i)(mongodb(?:\\+srv)?://)([^:@/]+):([^@/]+)@", "$1$2:*****@");
    }
}

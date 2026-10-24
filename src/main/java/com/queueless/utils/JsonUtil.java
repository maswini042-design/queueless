package com.queueless.utils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

/**
 * Singleton JSON serializer/deserializer configuration using Google Gson.
 */
public class JsonUtil {
    private static final Gson gson = new GsonBuilder()
            .setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
            .serializeNulls()
            .create();

    public static Gson getGson() {
        return gson;
    }

    public static String toJson(Object obj) {
        return gson.toJson(obj);
    }

    public static <T> T fromJson(String json, Class<T> classOfT) {
        return gson.fromJson(json, classOfT);
    }
}

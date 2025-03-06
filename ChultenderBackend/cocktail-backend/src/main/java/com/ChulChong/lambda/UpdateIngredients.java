package com.ChulChong.lambda;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

import java.io.FileOutputStream;
import java.io.IOException;
import java.sql.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class UpdateIngredients implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {

    private static final String BUCKET_NAME = "chultender.com";
    private static final String S3_KEY = "recipes.db";
    private static final String LOCAL_DB_PATH = "/tmp/recipes.db";
    private static final S3Client s3Client = S3Client.builder().build();

    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent event, Context context) {
        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
        ObjectMapper objectMapper = new ObjectMapper();

        try {
            if (event == null || event.getBody() == null || event.getBody().trim().isEmpty()) {
                throw new IllegalArgumentException("Received null or empty event from API Gateway");
            }

            System.out.println("🔍 Received JSON payload: " + event.getBody());

            // ✅ Parse JSON correctly as a list of ingredients
            List<Ingredient> ingredients = objectMapper.readValue(event.getBody(), new TypeReference<List<Ingredient>>() {
            });

            if (ingredients.isEmpty()) {
                throw new IllegalArgumentException("Received an empty ingredients array.");
            }

            downloadFromS3();
            for (Ingredient ingredient : ingredients) {
                updateIngredientInDatabase(ingredient);
            }
            uploadToS3();

            response.setStatusCode(200);
            response.setHeaders(getCorsHeaders());
            response.setBody("{\"message\": \"Ingredients updated successfully\"}");
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatusCode(500);
            response.setHeaders(getCorsHeaders());
            response.setBody("{\"error\": \"" + e.getMessage() + "\"}");
        }

        return response;
    }

    private Map<String, String> getCorsHeaders() {
        Map<String, String> headers = new HashMap<>();
        headers.put("Access-Control-Allow-Origin", "*");
        headers.put("Access-Control-Allow-Methods", "OPTIONS,GET,POST");
        headers.put("Access-Control-Allow-Headers", "Content-Type");
        return headers;
    }

    private static void downloadFromS3() throws IOException {
        GetObjectRequest getReq = GetObjectRequest.builder()
                .bucket(BUCKET_NAME)
                .key(S3_KEY)
                .build();

        try (ResponseInputStream<GetObjectResponse> s3Object = s3Client.getObject(getReq);
             FileOutputStream fos = new FileOutputStream(LOCAL_DB_PATH)) {
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = s3Object.read(buffer)) != -1) {
                fos.write(buffer, 0, bytesRead);
            }
        }
    }

    private static void uploadToS3() throws IOException {
        System.out.println("📤 Uploading updated recipes.db to S3...");
        // Add upload logic here if needed
    }

    private void updateIngredientInDatabase(Ingredient ingredient) throws SQLException {
        String updateQuery = "UPDATE ingredients SET isActive = ?, isMainLiqour = ? WHERE id = ?";

        try (Connection conn = DriverManager.getConnection("jdbc:sqlite:/tmp/recipes.db");
             PreparedStatement stmt = conn.prepareStatement(updateQuery)) {

            stmt.setBoolean(1, ingredient.isActive());
            stmt.setBoolean(2, ingredient.isMainLiqour());
            stmt.setInt(3, ingredient.getId());

            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected == 0) {
                System.out.println("No ingredient updated: " + ingredient.getName());
            } else {
                System.out.println("✅ Updated ingredient: " + ingredient.getName());
            }
        }
    }
}
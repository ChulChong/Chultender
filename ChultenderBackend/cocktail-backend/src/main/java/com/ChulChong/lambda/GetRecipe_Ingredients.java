package com.ChulChong.lambda;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import org.json.JSONArray;
import org.json.JSONObject;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;

import java.io.FileOutputStream;
import java.io.IOException;
import java.sql.*;
import java.util.HashMap;
import java.util.Map;

public class GetRecipe_Ingredients implements RequestHandler<Map<String, Object>, APIGatewayProxyResponseEvent> {

    private static final String BUCKET_NAME = "chultender.com";
    private static final String S3_KEY = "recipes.db";
    private static final String LOCAL_DB_PATH = "/tmp/recipes.db";
    private final S3Client s3Client = S3Client.builder().build();

    @Override
    public APIGatewayProxyResponseEvent handleRequest(Map<String, Object> input, Context context) {
        APIGatewayProxyResponseEvent response = new APIGatewayProxyResponseEvent();
        try {
            // ✅ Download the SQLite file from S3
            downloadFromS3();

            // ✅ Query the SQLite database
            String result = queryDatabase();

            // ✅ Return a successful response with CORS headers
            return response
                    .withStatusCode(200)
                    .withHeaders(getCorsHeaders())
                    .withBody(result);
        } catch (IOException e) {
            context.getLogger().log("🚨 Error: Failed to download from S3 - " + e.getMessage());
            return response
                    .withStatusCode(500)
                    .withHeaders(getCorsHeaders())
                    .withBody("Error: Failed to download from S3 - " + e.getMessage());
        } catch (SQLException e) {
            context.getLogger().log("🚨 Error: Database query failed - " + e.getMessage());
            return response
                    .withStatusCode(500)
                    .withHeaders(getCorsHeaders())
                    .withBody("Error: Database query failed - " + e.getMessage());
        } catch (Exception e) {
            context.getLogger().log("🚨 Error: Unexpected error - " + e.getMessage());
            return response
                    .withStatusCode(500)
                    .withHeaders(getCorsHeaders())
                    .withBody("Error: Unexpected error - " + e.getMessage());
        }
    }

    private Map<String, String> getCorsHeaders() {
        Map<String, String> headers = new HashMap<>();
        headers.put("Access-Control-Allow-Origin", "*");
        headers.put("Access-Control-Allow-Methods", "OPTIONS,GET,POST");
        headers.put("Access-Control-Allow-Headers", "Content-Type");
        return headers;
    }


    private void downloadFromS3() throws IOException {
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

    private String queryDatabase() throws SQLException {
        try (Connection conn = DriverManager.getConnection("jdbc:sqlite:" + LOCAL_DB_PATH);
             Statement stmt = conn.createStatement()) {

            //get recipe_ingredients
            ResultSet rs = stmt.executeQuery("SELECT * FROM recipe_ingredients");
            JSONArray recipe_ingredientsArr = new JSONArray();
            while (rs.next()) {
                int id_json = rs.getInt("id");
                int recipe_id_json = rs.getInt("recipe_id");
                int ingredient_id_json = rs.getInt("ingredient_id");
                String size_json = rs.getString("size");
                JSONObject jsonObject = new JSONObject();
                jsonObject.put("recipe_id", recipe_id_json);
                jsonObject.put("ingredient_id", ingredient_id_json);
                jsonObject.put("size", size_json);
                jsonObject.put("id", id_json);
                recipe_ingredientsArr.put(jsonObject);
            }

            JSONObject jObjDevice = new JSONObject();
            jObjDevice.put("recipe_ingredients", recipe_ingredientsArr);
            System.out.println(jObjDevice);

            return jObjDevice.toString();
        }
    }
}

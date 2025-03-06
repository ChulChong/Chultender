package com.ChulChong.lambda;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true) // This allows extra fields without failing
public class Ingredient {

    private int id;
    private String name;
    private boolean isActive;
    private boolean isMainLiqour;

    // ✅ Constructor
    public Ingredient() {
    }

    // ✅ Getters
    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public boolean isActive() {
        return isActive;
    }

    public boolean isMainLiqour() {
        return isMainLiqour;
    }

    // ✅ Setters (needed for Jackson deserialization)
    @JsonProperty("id")
    public void setId(int id) {
        this.id = id;
    }

    @JsonProperty("name")
    public void setName(String name) {
        this.name = name;
    }

    @JsonProperty("isActive")
    public void setActive(boolean isActive) {
        this.isActive = isActive;
    }

    @JsonProperty("isMainLiqour")
    public void setMainLiqour(boolean isMainLiqour) {
        this.isMainLiqour = isMainLiqour;
    }
}
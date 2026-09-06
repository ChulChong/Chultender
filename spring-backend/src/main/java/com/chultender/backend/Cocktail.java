package com.chultender.backend;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;

/**
 * Maps to the existing "cocktails" table in Supabase Postgres — the same
 * table src/lib/supabaseClient.js reads from in the React app. Schema is
 * owned by the Supabase SQL editor (see the migration SQL in the main
 * project); this entity never creates or alters it
 * (spring.jpa.hibernate.ddl-auto=none).
 */
@Entity
@Table(name = "cocktails")
public class Cocktail {

    @Id
    @NotBlank
    private String id;

    @NotBlank
    private String name;

    // Postgres text[] <-> Java String[], via Hibernate 6's native array
    // support (no extra dependency needed).
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private String[] ingredients;

    private String details;

    private String cup;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "background_color")
    private String backgroundColor;

    @Column(name = "font_color")
    private String fontColor;

    @Column(name = "is_show")
    private Boolean isShow;

    // The ingredient the admin marked as "Base" when adding/editing the
    // cocktail (see AddCocktail.js) — a clean, explicit label instead of
    // guessing it from ingredient text on every read.
    @Column(name = "base_spirit")
    private String baseSpirit;

    // Admin-picked mood/style tags (Fresh, Strong, Sweet, ...) shown as
    // filters on the /Recommend page — same explicit-field pattern as
    // base_spirit, not inferred from ingredients.
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private String[] tags;

    // Ingredient-keyword ids this drink needs (see ingredient_keywords /
    // IngredientKeyword.isOwned) — admin-picked from the same chip list
    // AddCocktail.js already offers, same explicit-field pattern as
    // base_spirit/tags. Chultender.js hides the drink unless every id
    // here is currently owned.
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "required_keywords", columnDefinition = "text[]")
    private String[] requiredKeywords;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    public Cocktail() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String[] getIngredients() {
        return ingredients;
    }

    public void setIngredients(String[] ingredients) {
        this.ingredients = ingredients;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getCup() {
        return cup;
    }

    public void setCup(String cup) {
        this.cup = cup;
    }

    // @JsonProperty overrides here match the snake_case field names the
    // React app already speaks (it read/wrote these via Supabase's
    // PostgREST, which returns raw column names) — keeps the frontend's
    // existing field references working unchanged against this API too.
    @JsonProperty("image_url")
    public String getImageUrl() {
        return imageUrl;
    }

    @JsonProperty("image_url")
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    @JsonProperty("background_color")
    public String getBackgroundColor() {
        return backgroundColor;
    }

    @JsonProperty("background_color")
    public void setBackgroundColor(String backgroundColor) {
        this.backgroundColor = backgroundColor;
    }

    @JsonProperty("font_color")
    public String getFontColor() {
        return fontColor;
    }

    @JsonProperty("font_color")
    public void setFontColor(String fontColor) {
        this.fontColor = fontColor;
    }

    @JsonProperty("is_show")
    public Boolean getIsShow() {
        return isShow;
    }

    @JsonProperty("is_show")
    public void setIsShow(Boolean isShow) {
        this.isShow = isShow;
    }

    @JsonProperty("created_at")
    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    @JsonProperty("base_spirit")
    public String getBaseSpirit() {
        return baseSpirit;
    }

    @JsonProperty("base_spirit")
    public void setBaseSpirit(String baseSpirit) {
        this.baseSpirit = baseSpirit;
    }

    public String[] getTags() {
        return tags;
    }

    public void setTags(String[] tags) {
        this.tags = tags;
    }

    @JsonProperty("required_keywords")
    public String[] getRequiredKeywords() {
        return requiredKeywords;
    }

    @JsonProperty("required_keywords")
    public void setRequiredKeywords(String[] requiredKeywords) {
        this.requiredKeywords = requiredKeywords;
    }
}

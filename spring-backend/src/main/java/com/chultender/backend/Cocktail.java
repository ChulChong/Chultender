package com.chultender.backend;

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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getBackgroundColor() {
        return backgroundColor;
    }

    public void setBackgroundColor(String backgroundColor) {
        this.backgroundColor = backgroundColor;
    }

    public String getFontColor() {
        return fontColor;
    }

    public void setFontColor(String fontColor) {
        this.fontColor = fontColor;
    }

    public Boolean getIsShow() {
        return isShow;
    }

    public void setIsShow(Boolean isShow) {
        this.isShow = isShow;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}

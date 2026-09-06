package com.chultender.backend;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

/**
 * Maps to the existing "ingredient_keywords" table — the list of chip
 * options AddCocktail.js offers when adding an ingredient line.
 */
@Entity
@Table(name = "ingredient_keywords")
public class IngredientKeyword {

    @Id
    @NotBlank
    private String id;

    @NotBlank
    private String name;

    // Whether this ingredient is currently in the admin's bar (see the
    // Bar Inventory panel in AddCocktail.js). Drives which cocktails
    // Chultender.js shows — a drink is hidden unless every id in its
    // required_keywords is owned. Defaults false so a brand-new keyword
    // doesn't silently make every drink that needs it visible.
    @Column(name = "is_owned")
    private Boolean isOwned = false;

    public IngredientKeyword() {
    }

    public IngredientKeyword(String id, String name) {
        this.id = id;
        this.name = name;
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

    @JsonProperty("is_owned")
    public Boolean getIsOwned() {
        return isOwned;
    }

    @JsonProperty("is_owned")
    public void setIsOwned(Boolean isOwned) {
        this.isOwned = isOwned;
    }
}

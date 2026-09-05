package com.chultender.backend;

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
}

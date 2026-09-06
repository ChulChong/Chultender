package com.chultender.backend;

/** Thrown by {@link CocktailService#delete} when the id doesn't exist —
 * mapped to 404 Not Found in {@link CocktailController}. */
public class CocktailNotFoundException extends RuntimeException {
    public CocktailNotFoundException(String id) {
        super("No cocktail with id \"" + id + "\".");
    }
}

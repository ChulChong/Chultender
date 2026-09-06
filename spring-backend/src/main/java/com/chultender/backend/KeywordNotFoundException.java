package com.chultender.backend;

/** Thrown by {@link IngredientKeywordService#delete} when the id doesn't
 * exist — mapped to 404 Not Found in {@link IngredientKeywordController}. */
public class KeywordNotFoundException extends RuntimeException {
    public KeywordNotFoundException(String id) {
        super("No ingredient keyword with id \"" + id + "\".");
    }
}

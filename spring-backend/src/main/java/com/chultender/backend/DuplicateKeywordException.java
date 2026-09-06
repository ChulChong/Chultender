package com.chultender.backend;

/** Thrown by {@link IngredientKeywordService#create} only on the rare race
 * where two requests create the same new id at once (the common duplicate
 * case is handled earlier by returning the existing row instead of
 * erroring) — mapped to 409 Conflict in {@link IngredientKeywordController}. */
public class DuplicateKeywordException extends RuntimeException {
    public DuplicateKeywordException(String id) {
        super("Keyword id already exists: " + id);
    }
}

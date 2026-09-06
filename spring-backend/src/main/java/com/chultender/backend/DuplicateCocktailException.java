package com.chultender.backend;

/** Thrown by {@link CocktailService#create} when the (possibly slugified)
 * id already exists — mapped to 409 Conflict in {@link CocktailController}. */
public class DuplicateCocktailException extends RuntimeException {
    public DuplicateCocktailException(String id) {
        super("A cocktail with id \"" + id + "\" already exists.");
    }
}

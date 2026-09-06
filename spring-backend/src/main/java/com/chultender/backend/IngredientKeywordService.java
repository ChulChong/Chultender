package com.chultender.backend;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Business logic for the "ingredient_keywords" table — id slugification,
 * the idempotent-on-duplicate create behavior, and the Bar Inventory
 * "is_owned" toggle, moved out of {@link IngredientKeywordController} so
 * the controller is left doing only HTTP mapping.
 */
@Service
public class IngredientKeywordService {

    private final IngredientKeywordRepository repository;

    public IngredientKeywordService(IngredientKeywordRepository repository) {
        this.repository = repository;
    }

    public List<IngredientKeyword> list() {
        return repository.findAllByOrderByNameAsc();
    }

    /** {@code created} is false when an existing row was returned instead
     * of a new one — same idempotent-on-duplicate behavior the React app
     * already relied on for this table (ignores 23505). Throws
     * {@link DuplicateKeywordException} only on the rare race where two
     * requests create the same brand-new id at once. */
    public record CreationResult(IngredientKeyword keyword, boolean created) {
    }

    public CreationResult create(String rawName, String rawId) {
        String name = rawName == null ? null : rawName.trim();
        if (name == null || name.isEmpty()) {
            throw new IllegalArgumentException("name is required");
        }
        String id = (rawId == null || rawId.trim().isEmpty()) ? slugify(name) : rawId.trim();

        Optional<IngredientKeyword> existing = repository.findById(id);
        if (existing.isPresent()) {
            return new CreationResult(existing.get(), false);
        }
        try {
            return new CreationResult(repository.save(new IngredientKeyword(id, name)), true);
        } catch (DataIntegrityViolationException e) {
            throw new DuplicateKeywordException(id);
        }
    }

    /** Bar Inventory panel (AddCocktail.js) — marks whether the admin
     * currently has this ingredient in stock. Empty if the id doesn't exist. */
    public Optional<IngredientKeyword> setOwned(String id, boolean isOwned) {
        return repository.findById(id).map(keyword -> {
            keyword.setIsOwned(isOwned);
            return repository.save(keyword);
        });
    }

    /** Throws {@link KeywordNotFoundException} if the id doesn't exist. A
     * {@code DataIntegrityViolationException} from the delete itself (the
     * keyword is referenced elsewhere) is left to propagate, same as
     * before this refactor. */
    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new KeywordNotFoundException(id);
        }
        repository.deleteById(id);
    }

    private String slugify(String name) {
        String slug = name.toLowerCase().trim().replaceAll("[^a-z0-9]+", "-");
        slug = slug.replaceAll("^-+|-+$", "");
        return slug.isEmpty() ? "keyword" : slug;
    }
}

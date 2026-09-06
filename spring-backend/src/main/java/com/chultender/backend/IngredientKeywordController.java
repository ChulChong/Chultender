package com.chultender.backend;

import java.util.List;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ingredient-keywords")
@CrossOrigin(origins = "*")
public class IngredientKeywordController {

    private final IngredientKeywordRepository repository;

    public IngredientKeywordController(IngredientKeywordRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<IngredientKeyword> list() {
        return repository.findAllByOrderByNameAsc();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) {
        String name = body.get("name") == null ? null : body.get("name").trim();
        if (name == null || name.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "name is required"));
        }
        String id = body.get("id");
        if (id == null || id.trim().isEmpty()) {
            id = slugify(name);
        } else {
            id = id.trim();
        }

        if (repository.existsById(id)) {
            // Same idempotent-on-duplicate behavior the React app already
            // relies on for this table (ignores 23505 from Supabase).
            return ResponseEntity.ok(repository.findById(id).orElseThrow());
        }

        try {
            IngredientKeyword saved = repository.save(new IngredientKeyword(id, name));
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Keyword id already exists: " + id));
        }
    }

    /** Toggles whether the admin currently has this ingredient in stock
     * (see the Bar Inventory panel in AddCocktail.js). Body: {"is_owned": true|false}. */
    @PatchMapping("/{id}")
    public ResponseEntity<?> setOwned(@PathVariable String id, @RequestBody Map<String, Boolean> body) {
        Boolean isOwned = body.get("is_owned");
        if (isOwned == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "is_owned is required"));
        }
        return repository.findById(id).map(keyword -> {
            keyword.setIsOwned(isOwned);
            return ResponseEntity.ok(repository.save(keyword));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        try {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Keyword is in use and cannot be deleted"));
        }
    }

    private String slugify(String name) {
        String slug = name.toLowerCase().trim().replaceAll("[^a-z0-9]+", "-");
        slug = slug.replaceAll("^-+|-+$", "");
        return slug.isEmpty() ? "keyword" : slug;
    }
}

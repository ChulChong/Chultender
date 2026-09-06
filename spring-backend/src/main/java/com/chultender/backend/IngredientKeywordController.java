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

/**
 * Just HTTP mapping here — slugification, the idempotent-on-duplicate
 * create rule, and the Bar Inventory toggle live in
 * {@link IngredientKeywordService}.
 */
@RestController
@RequestMapping("/api/ingredient-keywords")
@CrossOrigin(origins = "*")
public class IngredientKeywordController {

    private final IngredientKeywordService service;

    public IngredientKeywordController(IngredientKeywordService service) {
        this.service = service;
    }

    @GetMapping
    public List<IngredientKeyword> list() {
        return service.list();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) {
        try {
            IngredientKeywordService.CreationResult result = service.create(body.get("name"), body.get("id"));
            HttpStatus status = result.created() ? HttpStatus.CREATED : HttpStatus.OK;
            return ResponseEntity.status(status).body(result.keyword());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (DuplicateKeywordException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
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
        return service.setOwned(id, isOwned)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } catch (KeywordNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Keyword is in use and cannot be deleted"));
        }
    }
}

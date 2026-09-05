package com.chultender.backend;

import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;

/**
 * REST API for the "cocktails" table — an alternative to calling
 * Supabase's PostgREST directly from the browser. Points at the exact
 * same Postgres database (see application.properties), so data added
 * here shows up in the React app and vice versa.
 *
 * CORS is wide open (matches the app's current no-auth design — see
 * AddCocktail.js) so the CRA dev server on localhost:3000 can call it
 * directly while this is being explored.
 */
@RestController
@RequestMapping("/api/cocktails")
@CrossOrigin(origins = "*")
public class CocktailController {

    private final CocktailRepository repository;

    public CocktailController(CocktailRepository repository) {
        this.repository = repository;
    }

    /** Mirrors the React app's default query: visible drinks, by name. */
    @GetMapping
    public List<Cocktail> list(@RequestParam(name = "all", defaultValue = "false") boolean all) {
        return all ? repository.findAll() : repository.findByIsShowTrueOrderByNameAsc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cocktail> get(@PathVariable String id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Cocktail cocktail) {
        if (cocktail.getId() == null || cocktail.getId().isBlank()) {
            cocktail.setId(slugify(cocktail.getName()));
        }
        if (cocktail.getCup() == null) cocktail.setCup("ontherock");
        if (cocktail.getBackgroundColor() == null) cocktail.setBackgroundColor("#819651");
        if (cocktail.getFontColor() == null) cocktail.setFontColor("#ffffff");
        if (cocktail.getIsShow() == null) cocktail.setIsShow(true);
        if (cocktail.getIngredients() == null) cocktail.setIngredients(new String[0]);

        if (repository.existsById(cocktail.getId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("A cocktail with id \"" + cocktail.getId() + "\" already exists.");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(cocktail));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @Valid @RequestBody Cocktail update) {
        return repository.findById(id).map(existing -> {
            update.setId(id);
            return ResponseEntity.ok(repository.save(update));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        try {
            repository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Could not delete \"" + id + "\": " + e.getMostSpecificCause().getMessage());
        }
        return ResponseEntity.noContent().build();
    }

    private static String slugify(String name) {
        if (name == null) return "cocktail";
        return name.toLowerCase(Locale.ROOT)
                .trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }
}

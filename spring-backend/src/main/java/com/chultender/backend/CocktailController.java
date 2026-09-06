package com.chultender.backend;

import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API for the "cocktails" table — an alternative to calling
 * Supabase's PostgREST directly from the browser. Points at the exact
 * same Postgres database (see application.properties), so data added
 * here shows up in the React app and vice versa.
 *
 * CORS is wide open (matches the app's current no-auth design — see
 * AddCocktail.js) so the CRA dev server on localhost:3000 can call it
 * directly while this is being explored.
 *
 * Just HTTP mapping here — defaults, slugification, and duplicate/
 * not-found rules live in {@link CocktailService}.
 */
@RestController
@RequestMapping("/api/cocktails")
@CrossOrigin(origins = "*")
public class CocktailController {

    private final CocktailService service;

    public CocktailController(CocktailService service) {
        this.service = service;
    }

    @GetMapping
    public List<Cocktail> list(@RequestParam(name = "all", defaultValue = "false") boolean all) {
        return service.list(all);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cocktail> get(@PathVariable String id) {
        return service.get(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody Cocktail cocktail) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.create(cocktail));
        } catch (DuplicateCocktailException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @Valid @RequestBody Cocktail update) {
        return service.update(id, update)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } catch (CocktailNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Could not delete \"" + id + "\": " + e.getMostSpecificCause().getMessage());
        }
    }
}

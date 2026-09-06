package com.chultender.backend;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Business logic for the "cocktails" table — create-time defaults,
 * id slugification, and the duplicate/not-found rules that used to live
 * directly in {@link CocktailController}. The controller's job is now
 * just HTTP: map a request to a service call, map the result (or a
 * thrown exception) to a status code.
 */
@Service
public class CocktailService {

    private final CocktailRepository repository;

    public CocktailService(CocktailRepository repository) {
        this.repository = repository;
    }

    /** Mirrors the React app's default query: visible drinks, by name. */
    public List<Cocktail> list(boolean all) {
        return all ? repository.findAll() : repository.findByIsShowTrueOrderByNameAsc();
    }

    public Optional<Cocktail> get(String id) {
        return repository.findById(id);
    }

    /** Applies create-time defaults (slugified id, base_spirit, tags, ...)
     * and saves. Throws {@link DuplicateCocktailException} if the
     * (possibly just-slugified) id already exists. */
    public Cocktail create(Cocktail cocktail) {
        applyCreateDefaults(cocktail);
        if (repository.existsById(cocktail.getId())) {
            throw new DuplicateCocktailException(cocktail.getId());
        }
        return repository.save(cocktail);
    }

    /** Full replace of an existing cocktail. Empty if the id doesn't exist. */
    public Optional<Cocktail> update(String id, Cocktail update) {
        return repository.findById(id).map(existing -> {
            update.setId(id);
            return repository.save(update);
        });
    }

    /** Throws {@link CocktailNotFoundException} if the id doesn't exist.
     * A {@code DataIntegrityViolationException} from the delete itself
     * (a foreign-key conflict) is left to propagate — the controller
     * maps that one to 409, same as before this refactor. */
    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new CocktailNotFoundException(id);
        }
        repository.deleteById(id);
    }

    private void applyCreateDefaults(Cocktail cocktail) {
        if (cocktail.getId() == null || cocktail.getId().isBlank()) {
            cocktail.setId(slugify(cocktail.getName()));
        }
        if (cocktail.getCup() == null) cocktail.setCup("ontherock");
        if (cocktail.getBackgroundColor() == null) cocktail.setBackgroundColor("#819651");
        if (cocktail.getFontColor() == null) cocktail.setFontColor("#ffffff");
        if (cocktail.getIsShow() == null) cocktail.setIsShow(true);
        if (cocktail.getIngredients() == null) cocktail.setIngredients(new String[0]);
        if (cocktail.getBaseSpirit() == null || cocktail.getBaseSpirit().isBlank()) {
            cocktail.setBaseSpirit("Mixed");
        }
        if (cocktail.getTags() == null) cocktail.setTags(new String[0]);
        if (cocktail.getRequiredKeywords() == null) cocktail.setRequiredKeywords(new String[0]);
    }

    private static String slugify(String name) {
        if (name == null) return "cocktail";
        return name.toLowerCase(Locale.ROOT)
                .trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }
}

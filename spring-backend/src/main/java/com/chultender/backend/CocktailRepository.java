package com.chultender.backend;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CocktailRepository extends JpaRepository<Cocktail, String> {
    List<Cocktail> findByIsShowTrueOrderByNameAsc();
}

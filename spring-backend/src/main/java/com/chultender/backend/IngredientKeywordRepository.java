package com.chultender.backend;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IngredientKeywordRepository extends JpaRepository<IngredientKeyword, String> {
    List<IngredientKeyword> findAllByOrderByNameAsc();
}

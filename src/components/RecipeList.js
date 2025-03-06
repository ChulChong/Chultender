import React, { useState } from "react";
import { recipes } from "./Recipes"; // Import the recipes list

const RecipeList = () => {
  const [search, setSearch] = useState(""); // State for search input

  // Function to filter recipes based on the search input
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.ingredients.some((ingredient) =>
      ingredient.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      {/* Search Input Field */}
      <input
        type="text"
        placeholder="Search by ingredient..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "10px",
          width: "100%",
          borderRadius: "5px",
          border: "1px solid #ccc",
          marginBottom: "20px",
          fontSize: "16px",
        }}
      />

      {/* Recipe List */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              style={{
                background: recipe.backgroundcolor,
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                width: "100%",
                textAlign: "center",
              }}
            >
              <h3 style={{ color: recipe.fontcolor }}>{recipe.name}</h3>
              <img
                src={recipe.image}
                alt={recipe.name}
                style={{ width: "150px", borderRadius: "10px" }}
              />
              <p style={{ fontSize: "14px", color: "#555" }}>
                {recipe.ingredients.join(", ")}
              </p>
            </div>
          ))
        ) : (
          <p style={{ color: "red", fontSize: "16px" }}>No recipes found!</p>
        )}
      </div>
    </div>
  );
};

export default RecipeList;

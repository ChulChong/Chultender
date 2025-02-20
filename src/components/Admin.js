import React, { useState } from "react";
import GetIngredients from "./API/GetIngredients";
import GetRecipes from "./API/GetRecipes";
import "./Admin.css";

function Admin() {
  const [ingredientsData, setIngredientsData] = useState({});
  //const [recipesData, setRecipesData] = useState({});

  function handleIngredientsData(data) {
    setIngredientsData(data);
  }
  /*
  function handleRecipesData(data) {
    setRecipesData(data);
  }*/

  return;
  <div>{ingredientsData}</div>;
  // <GetIngredients SendIngredients={handleIngredientsData} />;
  // <GetRecipes SendRecipes={handleRecipesData} />;
}
export default Admin;

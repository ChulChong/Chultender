import Table from "react-bootstrap/Table";
import React, { useState, useEffect } from "react";
import "./Admin.css";

const Admin = () => {
  const [IngredientsData, setIngredientsData] = useState([]);
  const [RecipesData, setRecipesData] = useState([]);
  const [Recipe_IngredientsData, setRecipe_IngredientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //get Ingredeitns from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://oh8h3rgq94.execute-api.us-east-1.amazonaws.com/test/"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        console.log("Raw API Response:", jsonData);

        // Parse body only if it's a string
        const parsedData =
          typeof jsonData.body === "string"
            ? JSON.parse(jsonData.body)
            : jsonData.body;

        console.log("Parsed Data:", parsedData);

        if (parsedData.ingredients) {
          setIngredientsData(parsedData.ingredients);
        } else {
          console.warn("No 'ingredients' key found in response");
        }
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  //Get Recipes from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://tlm0pbhq4g.execute-api.us-east-1.amazonaws.com/Testing/GetRecipes"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        console.log("Raw API Response:", jsonData);

        // Parse body only if it's a string
        const parsedData =
          typeof jsonData.body === "string" ? JSON.parse(jsonData) : jsonData;

        console.log("Parsed Data:", parsedData);

        if (parsedData.recipes) {
          setRecipesData(parsedData.recipes);
        } else {
          console.warn("No 'recipes' key found in response");
        }
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  //Get Recipe_Ingredients from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://7p0alm97tb.execute-api.us-east-1.amazonaws.com/test/"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        console.log("Raw API Response:", jsonData);

        // Parse body only if it's a string
        const parsedData =
          typeof jsonData.body === "string"
            ? JSON.parse(jsonData.body)
            : jsonData.body;

        console.log("Parsed Data:", parsedData);

        if (parsedData.recipe_ingredients) {
          setRecipe_IngredientsData(parsedData.recipe_ingredients);
        } else {
          console.warn("No 'recipe_ingredients' key found in response");
        }
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔍 Log `data` only when it updates
  useEffect(() => {
    console.log("Updated Ingredients State Data:", IngredientsData);
  }, [IngredientsData]);
  useEffect(() => {
    console.log("Updated Recipes State Data:", RecipesData);
  }, [RecipesData]);
  useEffect(() => {
    console.log(
      "Updated recipe_ingredients State Data:",
      Recipe_IngredientsData
    );
  }, [Recipe_IngredientsData]);

  if (loading) {
    return <p>Loading data...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  // Create a lookup object for mainLiqourId to name mapping
  const mainLiqourLookup = IngredientsData.reduce((acc, ingredient) => {
    acc[ingredient.id] = ingredient.name;
    return acc;
  }, {});

  return (
    <Table striped bordered hover>
      <thead>
        <div>Ingredients</div>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>isActive</th>
          <th>isMainLiqour</th>
        </tr>
      </thead>
      <tbody>
        {IngredientsData.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.name}</td>
            <td>{item.isActive ? "✅" : "❌"}</td>
            <td>{item.isMainLiqour ? "✅" : "❌"}</td>
          </tr>
        ))}
      </tbody>
      <div>Recipes</div>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>mainLiqour</th>
          <th>glass</th>
          <th>details</th>
          <th>isActive</th>
        </tr>
      </thead>
      <tbody>
        {RecipesData.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.name}</td>
            <td>{mainLiqourLookup[item.mainLiqourId]}</td>
            <td>{item.glass}</td>
            <td>{item.details}</td>
            <td>{item.isActive ? "✅" : "❌"}</td>
          </tr>
        ))}
      </tbody>
      <div>recipe_ingredients</div>
      <thead>
        <tr>
          <th>ID</th>
          <th>recipe_id</th>
          <th>ingredient_id</th>
          <th>size</th>
        </tr>
      </thead>
      <tbody>
        {Recipe_IngredientsData.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.recipe_id}</td>
            <td>{item.ingredient_id}</td>
            <td>{item.size}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default Admin;

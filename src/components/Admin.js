import { useState, useEffect } from "react";
import getAPIKeys from "./APIkeys/APIkeys";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Accordion from "react-bootstrap/Accordion";

const Admin = () => {
  const [IngredientsData, setIngredientsData] = useState([]);
  const [updatedIngredients, setUpdatedIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch ingredients from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(getAPIKeys().ingredientsAPI);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        const parsedData =
          typeof jsonData.body === "string"
            ? JSON.parse(jsonData.body)
            : jsonData.body;

        if (parsedData.ingredients) {
          setIngredientsData(parsedData.ingredients);
        }
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Toggle isActive
  const toggleIsActive = (id) => {
    const updatedIngredientsList = IngredientsData.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, isActive: !item.isActive };
        setUpdatedIngredients((prev) => [
          ...prev.filter((i) => i.id !== id),
          updatedItem,
        ]); // ✅ Track changes
        return updatedItem;
      }
      return item;
    });
    setIngredientsData(updatedIngredientsList);
  };

  // Toggle isMainLiqour
  const toggleIsMainLiqour = (id) => {
    const updatedIngredientsList = IngredientsData.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, isMainLiqour: !item.isMainLiqour };
        setUpdatedIngredients((prev) => [
          ...prev.filter((i) => i.id !== id),
          updatedItem,
        ]); // ✅ Track changes
        return updatedItem;
      }
      return item;
    });
    setIngredientsData(updatedIngredientsList);
  };

  // Save only updated ingredients
  const saveIngredients = async () => {
    if (updatedIngredients.length === 0) {
      console.warn("No ingredients modified. Skipping API call.");
      return;
    }

    console.log("🚀 Sending Updated Ingredients to API:", updatedIngredients);

    try {
      const response = await fetch(getAPIKeys().ingredientsAPI, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedIngredients), // ✅ Send only updated ingredients
      });

      console.log("🛠️ API Response:", response);

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      setUpdatedIngredients([]); // ✅ Clear after successful update
    } catch (e) {
      console.error("❌ Error saving ingredients:", e);
      setError(e);
    }
  };

  return (
    <div className="admin">
      <Accordion>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Ingredients</Accordion.Header>
          <Accordion.Body>
            <Table striped bordered hover>
              <thead>
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
                    <td onClick={() => toggleIsActive(item.id)}>
                      {item.isActive ? "✅" : "❌"}
                    </td>
                    <td onClick={() => toggleIsMainLiqour(item.id)}>
                      {item.isMainLiqour ? "✅" : "❌"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Button onClick={saveIngredients}>Save Changes</Button>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default Admin;

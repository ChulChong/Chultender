import Table from "react-bootstrap/Table";
import React, { useState, useEffect } from "react";

function GetRecipes({ SendRecipes }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    //get Ingredeitns from API
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
          typeof jsonData.body === "string"
            ? JSON.parse(jsonData.body)
            : jsonData.body;

        console.log("Parsed Data:", parsedData);

        if (parsedData.recipes) {
          setData(parsedData.recipes);
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

  // 🔍 Log `data` only when it updates
  useEffect(() => {
    console.log("Updated State Data:", data);
  }, [data]);

  if (loading) {
    return <p>Loading data...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>mainLiqourId</th>
          <th>glass</th>
          <th>details</th>
          <th>isActive</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.name}</td>
            <td>{item.mainLiqourId}</td>
            <td>{item.glass}</td>
            <td>{item.details}</td>
            <td>{item.isActive ? "✅" : "❌"}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default GetRecipes;

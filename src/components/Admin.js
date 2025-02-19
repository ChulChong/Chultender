import Table from "react-bootstrap/Table";
import React, { useState, useEffect } from "react";
import "./Admin.css";

const Admin = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        // ✅ Correctly setting the array from 'ingredients'
        if (parsedData.ingredients) {
          setData(parsedData.ingredients);
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
          <th>IsActive</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.name}</td>
            {/* ✅ Fix: Use 'IsActive' (uppercase) based on API response */}
            <td>{item.IsActive ? "✅" : "❌"}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default Admin;

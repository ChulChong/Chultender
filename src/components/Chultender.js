// filepath: /Users/chulchong/cs/hometender/src/components/Chultender.js
import Helper from "./Helper";
import { useEffect, useState } from "react";
import "./Chultender.css";
import { useNavigate } from "react-router-dom";
import { recipes } from "./Recipes";
import chultender from "../image/chultender.gif";
import Button from "react-bootstrap/Button";

function Chultender() {
  const navigate = useNavigate();

  const AdminOnClick = () => {
    navigate("/Admin");
  };

  const [search, setSearch] = useState(""); // State for search input

  // Function to filter recipes based on the search input
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.ingredients.some((ingredient) =>
      ingredient.toLowerCase().includes(search.toLowerCase())
    )
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      Helper();
    }, 100); // Delay to ensure DOM is fully updated
    return () => clearTimeout(timer); // Cleanup the timer
  }, [search, filteredRecipes]);

  const dummyDataLoop = (dummydata) => {
    var rows = [];
    for (let i = 0; i < dummydata.length; i++) {
      rows.push(<div key={i}>{dummydata[i]}</div>);
    }
    return rows;
  };

  const listItems = filteredRecipes.map((drink) => (
    <div key={drink.id}>
      <div className="outer" id={drink.id}>
        <button
          className="accordion"
          id={drink.id}
          style={{
            backgroundColor: drink.backgroundcolor,
            color: drink.fontcolor,
          }}
        >
          {drink.name}
        </button>
        <div
          className="panel"
          style={{
            backgroundColor: drink.backgroundcolor,
            color: drink.fontcolor,
          }}
        >
          <div className="ingredients">
            <div>{dummyDataLoop(drink.ingredients)}</div>
          </div>
          <div className="details">{drink.details}</div>
          <div className="picture-wrapper">
            <img
              className={"picture " + drink.cup}
              src={drink.image}
              alt=""
              id={drink.id}
            />
          </div>
        </div>
      </div>
    </div>
  ));

  return (
    <div style={{ backgroundColor: "#0A08AC" }}>
      <img src={chultender} className="neonsign" alt="" />
      {/*
      <div>
        <Button onClick={AdminOnClick}>admin</Button>
      </div>*/}
      <h1 style={{ textAlign: "center", color: "#333" }}>Cocktail Finder</h1>
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

      {listItems}
    </div>
  );
}

export default Chultender;

import Helper from "./Helper";
import { useEffect } from "react";
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

  useEffect(() => {
    Helper();
  });

  const dummyDataLoop = (dummydata) => {
    var rows = [];
    for (let i = 0; i < dummydata.length; i++) {
      rows.push(<div key={i}>{dummydata[i]}</div>);
    }
    return rows;
  };

  const listItems = recipes.map((drink) => (
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
      <div>
        <Button onClick={AdminOnClick}>admin</Button>
      </div>
      {listItems}
    </div>
  );
}

export default Chultender;

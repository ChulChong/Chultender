import Helper from "./Helper";
import { useEffect } from "react";
import "./Chultender.css";
import { recipes } from "./Recipes";
import chultender from "../image/chultender.gif";

function Chultender() {
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
        <button className="accordion" id={drink.id}>
          {drink.name}
        </button>
        <div className="panel" id={drink.id}>
          <div className="ingredients" id={drink.id}>
            <div>{dummyDataLoop(drink.ingredients)}</div>
          </div>
          <div className="details" id={drink.id}>
            {drink.details}
          </div>
          <div className="picture-wrapper" id={drink.id}>
            <img className="picture" src={drink.image} id={drink.id} alt="" />
          </div>
        </div>
      </div>
    </div>
  ));

  return (
    <div style={{ backgroundColor: "#0A08AC" }}>
      <img src={chultender} className="neonsign" alt="" />
      {listItems}
    </div>
  );
}

export default Chultender;

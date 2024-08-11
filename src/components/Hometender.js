import Helper from "./Helper";
import { useEffect } from "react";
import "./Hometender.css";
import { recipes } from "./Recipes";

function Hometender() {
  useEffect(() => {
    Helper();
  });
  const dummyDataLoop = (dummydata) => {
    var rows = [];
    for (let i = 0; i < dummydata.length; i++) {
      rows.push(<div>{dummydata[i]}</div>);
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

  return <div>{listItems}</div>;
}

export default Hometender;

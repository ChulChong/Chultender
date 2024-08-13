import churista from "../image/churista.gif";
import "./Churista.css";
import { cafemenu } from "./Cafemenu";

const Churista = () => {
  const listItems = cafemenu.map((drink) => (
    <div>
      <div className="block" id={drink.id}>
        <img
          src={drink.image}
          id={drink.id}
          alt=""
          className="coffee-image"
        ></img>
        <div className="drinkname" id={drink.id}>
          {drink.drinkname}
        </div>
      </div>
    </div>
  ));

  return (
    <div>
      <img src={churista} alt="" className="neonsign"></img>
      {listItems}
    </div>
  );
};

export default Churista;

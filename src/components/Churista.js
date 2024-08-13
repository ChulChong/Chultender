import churista from "../image/churista.gif";
import "./Churista.css";
import { useEffect } from "react";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { cafemenu } from "./Cafemenu";

const Churista = () => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

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

import churista from "../image/churista.gif";
import "./Churista.css";
import { cafemenu } from "./Cafemenu";
import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import CloseButton from "react-bootstrap/CloseButton";
import Button from "react-bootstrap/Button";
import ToggleButton from "react-bootstrap/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";

const Churista = () => {
  const [fullscreen, setFullscreen] = useState(true);
  const [show, setShow] = useState(false);
  const [currentDrinkData, setCurrentDrinkData] = useState([]);
  const [IsIced, setIsIced] = useState(false);

  const listItems = cafemenu.map((drink) => (
    <div onClick={() => handleOnClick(drink)}>
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

  function handleShow() {
    if (show) {
      setFullscreen(false);
      setShow(false);
      setIsIced(false);
    } else {
      setFullscreen(true);
      setShow(true);
    }
  }

  function handleOnClick(drink) {
    handleShow();
    setCurrentDrinkData({ ...drink });
  }

  const handleIsIcedOnClick = (value) => {
    setIsIced(value);
  };

  useEffect((value) => {
    handleIsIcedOnClick(value);
  }, []);

  return (
    <div>
      <img src={churista} alt="" className="neonsign"></img>
      <div>{listItems}</div>
      <Modal
        show={show}
        fullscreen={fullscreen}
        onHide={() => setShow(false)}
        id={currentDrinkData.id}
      >
        <Modal.Body>
          <CloseButton variant="white" onClick={() => handleShow()} />
          <div>
            {!IsIced && (
              <img
                src={currentDrinkData.image}
                alt=""
                className="modal-coffee-image"
              ></img>
            )}
            {IsIced && (
              <img
                src={currentDrinkData.icedimage}
                alt=""
                className="modal-iced-coffee-image"
              ></img>
            )}

            <div className="drink-name">{currentDrinkData.drinkname}</div>
            <div>
              <div className="Button">
                <ToggleButtonGroup
                  type="radio"
                  name="options"
                  defaultValue={false}
                >
                  <ToggleButton
                    id="hot"
                    value={false}
                    className={IsIced ? "boxshadow" : ""}
                    onClick={() => handleIsIcedOnClick(false)}
                  >
                    Hot
                  </ToggleButton>
                  <ToggleButton
                    id="iced"
                    style={{ marginLeft: "5rem" }}
                    value={true}
                    className={IsIced ? "" : "boxshadow"}
                    onClick={() => handleIsIcedOnClick(true)}
                  >
                    Iced
                  </ToggleButton>
                </ToggleButtonGroup>
                <Button className="order-button boxshadow">Place order</Button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Churista;

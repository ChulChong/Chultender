import churista from "../image/churista.gif";
import "./Churista.css";
import { cafemenu } from "./Cafemenu";
import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import CloseButton from "react-bootstrap/CloseButton";
import Button from "react-bootstrap/Button";
import ToggleButton from "react-bootstrap/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import emailjs from "@emailjs/browser";

const Churista = () => {
  const [fullscreen, setFullscreen] = useState(true);
  const [show, setShow] = useState(false);
  const [insideModalshow, setinsideModalShow] = useState(false);
  const [currentDrinkData, setCurrentDrinkData] = useState([]);
  const [submitData, updateSubmitData] = useState({
    name: "",
    drinkname: "",
    isIced: "",
  });
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

  const sendEmail = (e) => {
    emailjs
      .send(
        "service_y4u4u9z",
        "template_kepzcvg",
        submitData,
        "uucLbm7oCkBcst-pE"
      )
      .then(
        (result) => {
          console.log(result.text);
        },
        (error) => {
          console.log(error.text);
        }
      );
  };

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

  //handle change function
  const handleChange = (event) => {
    updateSubmitData({
      ...submitData,
      [event.target.name]: event.target.value,
    });
    console.log(submitData);
  };

  function handleOnClick(drink) {
    handleShow();
    setCurrentDrinkData({ ...drink });
  }

  function handlePlaceOrderOnclick() {
    setinsideModalShow(true);
    if (IsIced) {
      updateSubmitData({
        drinkname: currentDrinkData.drinkname,
        isIced: "Iced",
      });
    } else {
      updateSubmitData({
        drinkname: currentDrinkData.drinkname,
        isIced: "Hot",
      });
    }
  }

  const handleOnsubmit = (event) => {
    event.preventDefault();
    sendEmail(submitData);
    console.log(submitData);
    handleShow();
  };

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
                <Button
                  className="order-button boxshadow"
                  onClick={() => handlePlaceOrderOnclick()}
                >
                  Place order
                </Button>
                <Modal
                  show={insideModalshow}
                  onHide={() => setinsideModalShow(false)}
                  id={currentDrinkData.id}
                  centered
                  className="insideModal"
                >
                  <Form onChange={handleChange} onSubmit={handleOnsubmit}>
                    <Row className="align-items-center">
                      <Form.Control
                        size="lg"
                        type="text"
                        name="name"
                        placeholder="Please type your name."
                        className="form"
                      />
                    </Row>
                    <Row className="align-items-center">
                      <div className="Button">
                        <Button type="submit" className="mb-2">
                          Submit
                        </Button>
                      </div>
                    </Row>
                  </Form>
                </Modal>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Churista;

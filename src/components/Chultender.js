import Helper from "./Helper";
import { useEffect, useState } from "react";
import "./Chultender.css";
import { useNavigate } from "react-router-dom";
import { recipes } from "./Recipes";
import chultender from "../image/chultender.gif";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import emailjs from "@emailjs/browser";

function Chultender() {
  const navigate = useNavigate();

  const AdminOnClick = () => {
    navigate("/Admin");
  };

  const [search, setSearch] = useState(""); // State for search input
  const [show, setShow] = useState(false);
  const [currentDrinkData, setCurrentDrinkData] = useState({});
  const [submitData, updateSubmitData] = useState({
    name: "",
    drinkname: "",
  });

  // Function to filter recipes based on the search input
  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.name.toLowerCase().includes(search.toLowerCase()) ||
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

  const handleOrderClick = (drink) => {
    setCurrentDrinkData(drink);
    updateSubmitData({ ...submitData, drinkname: drink.name });
    setShow(true);
  };

  const handleChange = (event) => {
    updateSubmitData({
      ...submitData,
      [event.target.name]: event.target.value,
    });
  };

  const handleOnSubmit = (event) => {
    event.preventDefault();
    sendEmail(submitData);
    setShow(false);
  };

  const sendEmail = (data) => {
    emailjs
      .send("service_y4u4u9z", "template_kepzcvg", data, "uucLbm7oCkBcst-pE")
      .then(
        (result) => {
          console.log(result.text);
        },
        (error) => {
          console.log(error.text);
        }
      );
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
          <Button
            onClick={() => handleOrderClick(drink)}
            style={{
              backgroundColor: drink.backgroundcolor,
              color: drink.fontcolor,
              fontSize: "40px",
              width: "20vh",
              padding: "10px",
              borderRadius: "20px",
              border: "1px solid #ccc",
            }}
          >
            Order this drink
          </Button>
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

      <input
        type="text"
        placeholder="Search by ingredient or cocktail name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "10px",
          width: "100%",
          borderRadius: "5px",
          border: "1px solid #ccc",
          marginBottom: "20px",
          fontSize: "40px",
        }}
      />

      {listItems}

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Body className="popup">
          <Form onChange={handleChange} onSubmit={handleOnSubmit}>
            <div className="submitform">
              <Form.Control
                size="lg"
                type="text"
                name="name"
                placeholder="Please type your name here."
                className="form"
                style={{ fontSize: "26px" }}
              />
              <div className="Button">
                <Button type="submit" className="mb-2">
                  Submit
                </Button>
              </div>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Chultender;

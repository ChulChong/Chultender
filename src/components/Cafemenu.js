import americano from "../image/Americano.png";
import cafelatte from "../image/cafelatte.png";
import cafemocha from "../image/cafemocha.png";
import whitemocha from "../image/whitemocha.png";
import caramelmacchiato from "../image/caramelmacchiato.png";
import vanillalatte from "../image/vanillalatte.png";
import handdrip from "../image/handdrip.png";
import affogato from "../image/affogato.png";

export const cafemenu = [
  {
    id: "americano",
    drinkname: "AMERICANO",
    ingredients: ["espresso 2 shots", "water"],
    image: americano,
  },
  {
    id: "cafelatte",
    drinkname: "CAFE LATTE",
    ingredients: ["espresso 2 shots", "milk"],
    image: cafelatte,
  },
  {
    id: "cafemocha",
    drinkname: "CAFE MOCHA",
    ingredients: ["espresso 2 shots", "chocolate syrup", "milk"],
    image: cafemocha,
  },

  {
    id: "caramelmacchiato",
    drinkname: "CARAMEL MACCHIATO",
    ingredients: ["espresso 2 shots", "caramel sauce", "vanilla syrup", "milk"],
    image: caramelmacchiato,
  },
  {
    id: "vanillalatte",
    drinkname: "VANILLA LATTE",
    ingredients: ["espresso 2 shots", "vanilla syrup", "milk"],
    image: vanillalatte,
  },
  {
    id: "whitemocha",
    drinkname: "WHITE MOCHA",
    ingredients: ["espresso 2 shots", "white chocolate syrup", "milk"],
    image: whitemocha,
  },
  {
    id: "handdrip",
    drinkname: "HAND DRIP",
    ingredients: [""],
    image: handdrip,
  },
  {
    id: "affogato",
    drinkname: "AFFOGATO",
    ingredients: ["espresso 2 shots", "ice cream scoops"],
    image: affogato,
  },
];

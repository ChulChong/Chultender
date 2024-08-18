import americano from "../image/Americano.png";
import icedAmericano from "../image/IcedAmericano.png";
import cafelatte from "../image/cafelatte.png";
import IcedLatte from "../image/IcedLatte.png";
import cafemocha from "../image/cafemocha.png";
import IcedMocha from "../image/IcedMocha.png";
import whitemocha from "../image/whitemocha.png";
import IcedWhiteMocha from "../image/IcedWhiteMocha.png";
import caramelmacchiato from "../image/caramelmacchiato.png";
import IcedCaramelMacchiato from "../image/IcedCaramelMacchiato.png";
import vanillalatte from "../image/vanillalatte.png";
import IcedVanillaLatte from "../image/IcedVanillaLatte.png";
import handdrip from "../image/handdrip.png";
import IcedHandDrip from "../image/IcedHandDrip.png";
import affogato from "../image/affogato.png";

export const cafemenu = [
  {
    id: "americano",
    drinkname: "Americano",
    ingredients: ["espresso 2 shots", "water"],
    image: americano,
    icedimage: icedAmericano,
  },
  {
    id: "cafelatte",
    drinkname: "Cafe Latte",
    ingredients: ["espresso 2 shots", "milk"],
    image: cafelatte,
    icedimage: IcedLatte,
  },
  {
    id: "cafemocha",
    drinkname: "Cafe Mocha",
    ingredients: ["espresso 2 shots", "chocolate syrup", "milk"],
    image: cafemocha,
    icedimage: IcedMocha,
  },

  {
    id: "caramelmacchiato",
    drinkname: "Caramel Macchiato",
    ingredients: ["espresso 2 shots", "caramel sauce", "vanilla syrup", "milk"],
    image: caramelmacchiato,
    icedimage: IcedCaramelMacchiato,
  },
  {
    id: "vanillalatte",
    drinkname: "Vanilla Latte",
    ingredients: ["espresso 2 shots", "vanilla syrup", "milk"],
    image: vanillalatte,
    icedimage: IcedVanillaLatte,
  },
  {
    id: "whitemocha",
    drinkname: "Wwhite Mocha",
    ingredients: ["espresso 2 shots", "white chocolate syrup", "milk"],
    image: whitemocha,
    icedimage: IcedWhiteMocha,
  },
  {
    id: "handdrip",
    drinkname: "Hand Drip",
    ingredients: [""],
    image: handdrip,
    icedimage: IcedHandDrip,
  },
  {
    id: "affogato",
    drinkname: "Affogato",
    ingredients: ["espresso 2 shots", "ice cream scoops"],
    image: affogato,
    icedimage: "",
  },
];

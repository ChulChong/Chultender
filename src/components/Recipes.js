import mintjulep from "../image/MintJulep.png";
import godfather from "../image/GodFather.png";
import jackcoke from "../image/JackCoke.png";
import bluehawaii from "../image/BlueHawaii.png";
import mojito from "../image/Mojito.png";
import pinacolada from "../image/pinacolada.png";
import whiskeysour from "../image/WhiskeySour.png";
import wildflower from "../image/WildFlower.png";
import amarettosour from "../image/amarettosour.png";
import sexymild from "../image/sexymild.png";
import kahluamlik from "../image/kahluamlik.png";
import bluesapphire from "../image/bluesapphire.png";
import cosmopolitan from "../image/cosmopolitan.png";
import midorisour from "../image/midorisour.png";
import orgasm from "../image/orgasm.png";
import shirleytemple from "../image/shirleytemple.png";
import dohwa from "../image/dohwa.png";

export const recipes = [
  {
    id: "mintjulep",

    name: "Mint Juelp",
    ingredients: [
      "2 oz Bourbon",
      "8 Mint Leaves",
      "1 Mint Sprig",
      "1/2 oz Simple Syrup",
    ],
    details:
      "Muddle the mint leaves and simple syrup in the bottom of a rocks glass or julep cup. Be brief and gentle; abrasive muddling will turn the mint bitter. Add crushed ice and bourbon to the glass, stirring until the glass frosts. Top with more ice, and serve with a straw and mint sprig to tickle your nose.",
    image: mintjulep,
    backgroundcolor: "#819651",
    fontcolor: "rgb(241, 255, 225)",
    cup: "julep",
  },
  {
    id: "godfather",
    name: "God Father",
    ingredients: ["1 1/8 oz Scotch", "1 1/8 oz Disaronno"],
    details:
      "Pour all ingredients into old fashioned glass filled with ice cubes. Stir gently.",
    image: godfather,
    backgroundcolor: "#c0713f",
    fontcolor: "rgb(255, 213, 135)",
    cup: "ontherock",
  },
  {
    id: "jackcoke",
    name: "Jack Coke",
    ingredients: ["1 1/2 oz Jack Daniel's", "1 Coke"],
    details: "",
    image: jackcoke,
    backgroundcolor: "#69392f",
    fontcolor: "rgb(232, 201, 201)",
    cup: "highball",
  },
  {
    id: "bluehawaii",
    name: "Blue Hawaii",
    ingredients: [
      "1 1/2 oz White Rum",
      "1 oz Blue Curaço",
      "1 oz Sweet & sour Mix",
      "4 oz Pineapple Juice",
    ],
    details: "",
    image: bluehawaii,
    backgroundcolor: "#4d91de",
    fontcolor: "rgb(126, 201, 255)",
    cup: "hurricane",
  },
  {
    id: "mojito",
    name: "Mojito",
    ingredients: [
      "1 1/3 oz White Rum",
      "1 oz Fresh Lime Juice",
      "6 Mint Sprigs",
      "2 Tsp White Sugar",
      "Soda Water",
    ],
    details:
      "Muddle mint sprigs with sugar and lime juice. Add splash of soda water and fill glass with cracked ice. Pour rum and top with soda water. Garnish with sprig of mint leaves and lime slice. Serve with straw.",
    image: mojito,
    backgroundcolor: "#819651",
    fontcolor: "rgb(241, 255, 225)",
    cup: "highball",
  },
  {
    id: "pinacolada",
    name: "Piña Colada",
    ingredients: [
      "1 oz White Rum",
      "2 oz Pineapple Juice",
      "3 oz Piña colada mix",
    ],
    details:
      "Blend all the ingredients with ice in an electric blender, pour into a large goblet or Hurricane glass and serve with straw. Garnish with a slice of pineapple or with a cocktail cherry.",
    image: pinacolada,
    backgroundcolor: "#e6ddcb",
    fontcolor: "rgb(148, 148, 61)",
    cup: "hurricane",
  },
  {
    id: "whiskeysour",
    name: "Whiskey Sour",
    ingredients: [
      "2 oz Bourbon",
      "3/4 oz Lemon Juice",
      "3/4 oz Simple Syrup",
      "1 Egg White",
    ],
    details:
      "Add the bourbon, fresh squeezed lemon juice, simple syrup, and egg white to the shaker. Shake first without ice (dry shake) and then shake again with ice. Strain into a rocks glass with ice. If available, double strain through a fine-mesh strainer. Garnish with a lemon peel.",
    image: whiskeysour,
    backgroundcolor: "#d6be50",
    fontcolor: "rgb(245, 255, 180)",
    cup: "martini",
  },
  {
    id: "wildflower",
    name: "Wild Flower",
    ingredients: [
      "1 oz Bourbon",
      "1/2 oz Peach Tree",
      "1/2 oz disaronno",
      "1/2 oz Lime Juice",
    ],
    details: "",
    image: wildflower,
    backgroundcolor: "#fc9a6d",
    fontcolor: "rgb(250, 201, 110)",
    cup: "ontherock",
  },
  {
    id: "amarettosour",
    name: "Amaretto Sour",
    ingredients: [
      "2 oz Amaretto",
      "3/4 oz Lemon Juice",
      "1/4 oz Simple Syrup",
      "1 Egg White",
    ],
    details: "Dry shaking then ice shaking",
    image: amarettosour,
    backgroundcolor: "#d66b29",
    fontcolor: "rgb(241, 255, 225)",
    cup: "coupe",
  },
  {
    id: "sexymild",
    name: "Sexy Mild",
    ingredients: [
      "1 oz Blue Curaço",
      "3 oz Piña colada mix",
      "3 oz Milk",
      "1 oz Sweet & Sour Mix",
    ],
    details: "",
    image: sexymild,
    backgroundcolor: "#a7c5bd",
    fontcolor: "aliceblue",
    cup: "snifter",
  },
  {
    id: "kahluamilk",
    name: "Kahlua Milk",
    ingredients: [
      "1 oz Kahlua",
      "1 oz Milk",
      "make mlik foam",
      "1/2 oz Kahlua",
      "2 oz Milk",
    ],
    details: "",
    image: kahluamlik,
    backgroundcolor: "#814118",
    fontcolor: "#ffffff",
    cup: "ontherock",
  },
  {
    id: "bluesapphire",
    name: "Blue Sapphire",
    ingredients: [
      "1/2 oz Peach Tree",
      "1/2 oz Malibu",
      "1/2 oz Blue Curaço",
      "1/2 oz Sweet & Sour Mix",
      "Sprite fill",
    ],
    details: "",
    image: bluesapphire,
    backgroundcolor: "#416062",
    fontcolor: "#ffffff",
    cup: "flute",
  },
  {
    id: "cosmopolitan",
    name: "Cosmopolitan",
    ingredients: [
      "1 1/3 oz Citron Vodka",
      "1/2 oz Triple sec",
      "1/2 oz Lime Juice",
      "1 oz CranBerry Juice",
    ],
    details: "",
    image: cosmopolitan,
    backgroundcolor: "#cc343f",
    fontcolor: "#ffffff",
    cup: "martini",
  },
  {
    id: "midorisour",
    name: "Midori Sour",
    ingredients: [
      "1 oz Midori",
      "1 oz Sweet & Sour Mix",
      "2/3 oz Lime Juice",
      "Sprite fill",
      "or",
      "2 oz Midori",
      "1 oz Lime Juice",
      "1 egg white",
    ],
    details: "",
    image: midorisour,
    backgroundcolor: "#4c574e",
    fontcolor: "#ffffff",
    cup: "highball",
  },
  {
    id: "orgasm",
    name: "Orgasm",
    ingredients: ["1/2 oz Baileys", "1/2 oz Kahlua", "1/2 oz Disaronno"],
    details: "",
    image: orgasm,
    backgroundcolor: "#bbb292",
    fontcolor: "#515151",
    cup: "coupe",
  },
  {
    id: "dohwa",
    name: "Dohwa (도화)",
    ingredients: [
      "1 oz Peach Tree",
      "2/3 oz Triple Sec",
      "1 1/2 oz Applce Juice",
      "1/3 oz Lemon Juice",
      "1/3 oz Lime Juice",
      "2 Tsp Grenadin Syrup",
      "Sparkling Water fill",
      "Mint top",
    ],
    details: "",
    image: dohwa,
    backgroundcolor: "#e4ddcb",
    fontcolor: "#515151",
    cup: "coupe",
  },
  {
    id: "shirleytemple",
    name: "Shirley Temple",
    ingredients: [
      "1/2 oz Grenadind Syrup",
      "1/3 oz Lime Juice",
      "Ginger Ale fill",
    ],
    details: "",
    image: shirleytemple,
    backgroundcolor: "#ab526b",
    fontcolor: "white",
    cup: "highball",
  },
];

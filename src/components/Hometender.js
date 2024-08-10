import "./Hometender.css";
import { useEffect } from "react";
import Helper from "./Helper";
import pictures from "./pictures";

const Hometender = () => {
  useEffect(() => {
    Helper();
  });

  return (
    <div class="container">
      <div class="tab tab-1">
        MINT JULEP
        <div class="ingredients">
          <div>2 oz Bourbon</div>
          <div>8 Mint Leaves</div>
          <div>1 MINT SPRIG</div>
          <div>1/2 oz SIMPLE SYRUP</div>
        </div>
        <div class="details">
          Muddle the mint leaves and simple syrup in the bottom of a rocks glass
          or julep cup. Be brief and gentle; abrasive muddling will turn the
          mint bitter. Add crushed ice and bourbon to the glass, stirring until
          the glass frosts. Top with more ice, and serve with a straw and mint
          sprig to tickle your nose.
        </div>
        <div
          class="picture"
          img="/Users/chulchong/cs/Hometender/public/image/MintJulep.png"
        ></div>
      </div>
      <div class="tab tab-2">
        MOJITO <br /> <br />
        <div class="ingredients">
          <div>1 1/3oz WHITE CUBAN RUM</div>
          <div>1 oz FRESH LIME JUICE</div>
          <div>6 MINT SPRINGS</div>
          <div>2 Tsp White Sugar</div>
          <div>SODA WATER</div>
        </div>
      </div>

      <div class="tab tab-3">
        Pina Colada <br /> <br />
        <div>2 oz Scotch</div>
        <div>2 oz Disaronno</div>
      </div>
      <div class="tab tab-4">
        Wild Flower <br /> <br />
        <div>2 oz Scotch</div>
        <div>2 oz Disaronno</div>
      </div>
      <div class="tab tab-4">
        Wild Flower <br /> <br />
        <div>2 oz Scotch</div>
        <div>2 oz Disaronno</div>
      </div>
      <div class="tab tab-4">
        Wild Flower <br /> <br />
        <div>2 oz Scotch</div>
        <div>2 oz Disaronno</div>
      </div>
      <div class="tab tab-4">
        Wild Flower <br /> <br />
        <div>2 oz Scotch</div>
        <div>2 oz Disaronno</div>
      </div>
      <div class="tab tab-4">
        Wild Flower <br /> <br />
        <div>2 oz Scotch</div>
        <div>2 oz Disaronno</div>
      </div>
      <div class="tab tab-4">
        Wild Flower <br /> <br />
        <div>2 oz Scotch</div>
        <div>2 oz Disaronno</div>
      </div>
    </div>
  );
};

export default Hometender;

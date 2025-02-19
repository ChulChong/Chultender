import { useNavigate } from "react-router-dom";
import { isMobile } from "react-device-detect";
import "./Layout.css";
import bartender from "../src/image/chultender.gif";
import barista from "../src/image/churista.gif";

const Layout = () => {
  const navigate = useNavigate();
  const churistaOnClick = () => {
    navigate("/Churista");
  };

  const chultenderOnClick = () => {
    navigate("/Chultender");
  };

  return (
    <div>
      {
        <div className="main">
          <div className="image">
            <img
              onClick={churistaOnClick}
              className="img"
              src={barista}
              alt=""
            ></img>

            <img
              onClick={chultenderOnClick}
              className="img2"
              src={bartender}
              alt=""
            ></img>
          </div>
        </div>
      }
      {!isMobile && <p>This app is only supported on mobile</p>}
    </div>
  );
};

export default Layout;

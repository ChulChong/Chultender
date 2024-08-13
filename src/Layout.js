import { Link } from "react-router-dom";
import { isMobile } from "react-device-detect";
import "./Layout.css";
import bartender from "../src/image/5145974.png";

const Layout = () => {
  return (
    <div>
      {
        <div className="main">
          <img className="img" src={bartender} alt=""></img>
          <div>
            <nav>
              <Link className="link" to="/Churista">
                Welcome to Churista
              </Link>
            </nav>
          </div>
          <div>
            <nav>
              <Link className="link" to="/Chultender">
                Welcome to Chultender
              </Link>
            </nav>
          </div>
        </div>
      }
      <p>This app is only supported on mobile </p>
    </div>
  );
};

export default Layout;

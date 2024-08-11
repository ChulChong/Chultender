import { Link } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import "./Layout.css";
import bartender from "../src/image/5145974.png";

const Layout = () => {
  const isDesktopOrLaptop = useMediaQuery({ query: "(min-width: 1224px)" });
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1224px)" });
  return (
    <div>
      {isDesktopOrLaptop && <p>This app is does not support desktop</p>}
      {isTabletOrMobile && (
        <div className="main">
          <img className="img" src={bartender} alt=""></img>
          <nav>
            <Link className="link" to="/Hometender">
              Welcome to Chultender
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Layout;

import { Link } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
const Layout = () => {
  const isDesktopOrLaptop = useMediaQuery({ query: "(min-width: 1224px)" });
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1224px)" });
  return (
    <div>
      {isDesktopOrLaptop && <p>Desktop no bueno</p>}
      {isTabletOrMobile && (
        <nav>
          <Link to="/Hometender">Welcome to Hometender</Link>
        </nav>
      )}
    </div>
  );
};

export default Layout;

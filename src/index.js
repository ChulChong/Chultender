import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chultender from "./components/Chultender";
import Churista from "./components/Churista";
import Admin from "./components/Admin";
import Layout from "./Layout";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}></Route>
        <Route path="/Chultender" element={<Chultender />}></Route>
        <Route path="/Churista" element={<Churista />}></Route>
        <Route path="/Admin" element={<Admin />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

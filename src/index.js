import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hometender from "./components/Hometender";
import Churista from "./components/Churista";
import Layout from "./Layout";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}></Route>
        <Route path="/Hometender" element={<Hometender />}></Route>
        <Route path="/Churista" element={<Churista />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

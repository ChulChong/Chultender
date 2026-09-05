import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chultender from "./components/Chultender";
import Churista from "./components/Churista";
import AddCocktail from "./components/AddCocktail";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Chultender />}></Route>
        <Route path="/Chultender" element={<Chultender />}></Route>
        <Route path="/Churista" element={<Churista />}></Route>
        {/* /Admin used to show an old ingredients table backed by a
            defunct AWS Lambda endpoint, with a link through to the
            cocktail admin page — that table never touched Supabase, so
            it's gone; both paths land straight on the real admin page. */}
        <Route path="/Admin" element={<AddCocktail />}></Route>
        <Route path="/AddCocktail" element={<AddCocktail />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Chultender.css";
import { backend } from "../lib/backendClient";
import emailjs from "@emailjs/browser";

// Not real security — just a quick, low-friction way in for the one
// person who needs it, instead of typing /Admin. Matches the rest of
// the app's no-auth design (see AddCocktail.js).
const ADMIN_PASSWORD = "987987";

// Base spirit shown next to each drink's name, derived from its
// ingredient list — first match wins. See design_handoff README for the
// exact list this mirrors.
const BASES = [
  "Bourbon",
  "Rye Whiskey",
  "Jack Daniel's",
  "Scotch",
  "Gin",
  "Vodka",
  "Rum",
  "Midori",
  "Campari",
  "Aperol",
  "St. Germain",
  "Peach Tree",
  "Amaretto",
  "Kahlua",
  "Prosecco",
  "Tequila",
];

function deriveBase(ingredients) {
  const hit = BASES.find((base) =>
    ingredients.some((ingredient) =>
      ingredient.toLowerCase().includes(base.toLowerCase())
    )
  );
  return hit === "Jack Daniel's" ? "Whiskey" : hit || "Mixed";
}

function Chultender() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [orderName, setOrderName] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [sent, setSent] = useState(false);
  const [sentLabel, setSentLabel] = useState("");
  const sentTimer = useRef(null);

  // Cocktails come from the Spring Boot backend (spring-backend/, deployed
  // at api.chultender.com), which itself reads the same Supabase Postgres
  // table this app used to call directly.
  useEffect(() => {
    backend.cocktails.list().then(({ data, error }) => {
      if (error) {
        console.error("Failed to load cocktails:", error.message);
      } else {
        setRecipes(data);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => () => clearTimeout(sentTimer.current), []);

  const drinks = useMemo(() => {
    const withBase = recipes.map((recipe) => ({
      ...recipe,
      base: deriveBase(recipe.ingredients),
    }));
    // Group by main liquor (base spirit) first, alphabetically, then by
    // drink name within each group.
    withBase.sort((a, b) => {
      const baseCompare = a.base.localeCompare(b.base);
      return baseCompare !== 0 ? baseCompare : a.name.localeCompare(b.name);
    });
    return withBase.map((drink, index) => ({
      ...drink,
      num: String(index + 1).padStart(2, "0"),
    }));
  }, [recipes]);

  // Same as the previous build: the last row (in the current sort order)
  // starts open. Runs once the sorted list is ready.
  useEffect(() => {
    if (open === null && drinks.length > 0) {
      setOpen(drinks[drinks.length - 1].id);
    }
  }, [drinks, open]);

  const query = search.trim().toLowerCase();
  const filteredDrinks = query
    ? drinks.filter(
        (drink) =>
          drink.name.toLowerCase().includes(query) ||
          drink.base.toLowerCase().includes(query) ||
          drink.ingredients.some((ingredient) =>
            ingredient.toLowerCase().includes(query)
          )
      )
    : drinks;

  const toggleDrink = (id) => {
    setOpen((current) => (current === id ? null : id));
  };

  const handleOrderClick = (drink) => {
    setOrderName(drink.name);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleSecretEntry = () => {
    const input = window.prompt("Password:");
    if (input === null) return; // cancelled
    if (input === ADMIN_PASSWORD) {
      navigate("/Admin");
    } else {
      window.alert("Wrong password.");
    }
  };

  const sendEmail = (data) => {
    emailjs
      .send("service_y4u4u9z", "template_kepzcvg", data, "uucLbm7oCkBcst-pE")
      .then(
        (result) => console.log(result.text),
        (error) => console.log(error.text)
      );
  };

  const submitOrder = () => {
    sendEmail({ name: orderBy, drinkname: orderName });
    setShowModal(false);
    setSent(true);
    setSentLabel(orderName);
    setOrderBy("");
    clearTimeout(sentTimer.current);
    sentTimer.current = setTimeout(() => setSent(false), 2600);
  };

  return (
    <div className="chultender-page">
      <div className="chultender-column">
        <div className="chultender-sticky">
          <div className="chultender-header">
            <div>
              <div className="chultender-brand">
                <button
                  type="button"
                  className="chultender-brand-dot"
                  onClick={handleSecretEntry}
                  aria-label="Admin"
                />
                <span className="chultender-brand-name">CHULTENDER</span>
              </div>
              <div className="chultender-tagline">
                Chul makes cocktails for you
              </div>
            </div>
            <div className="chultender-count">
              {filteredDrinks.length} / {drinks.length}
            </div>
          </div>
          <div className="chultender-search-wrap">
            <input
              type="text"
              className="chultender-search"
              placeholder="Search by ingredient or cocktail name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="chultender-empty">Loading cocktails…</div>
        ) : filteredDrinks.length === 0 ? (
          <div className="chultender-empty">
            Nothing matches &ldquo;{search}&rdquo;. Try a spirit — gin, rum,
            bourbon.
          </div>
        ) : (
          filteredDrinks.map((drink) => {
            const isOpen = open === drink.id;
            return (
              <div className="chultender-row" key={drink.id}>
                <button
                  className="chultender-row-header"
                  onClick={() => toggleDrink(drink.id)}
                >
                  <span className="chultender-row-num">{drink.num}</span>
                  <span className="chultender-row-name">{drink.name}</span>
                  <span className="chultender-row-base">{drink.base}</span>
                  <span className="chultender-row-sign">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                <div
                  className={
                    "chultender-panel-wrap" + (isOpen ? " open" : "")
                  }
                >
                  <div className="chultender-panel-inner">
                    <div className="chultender-panel-grid">
                      <div>
                        <div className="chultender-build-label">Build</div>
                        {drink.ingredients.map((ingredient, i) => (
                          <div className="chultender-ingredient" key={i}>
                            {ingredient}
                          </div>
                        ))}
                      </div>
                      {drink.image_url ? (
                        <div className="chultender-photo-cell">
                          <img
                            className="chultender-photo"
                            src={drink.image_url}
                            alt=""
                          />
                        </div>
                      ) : (
                        <div className="chultender-photo-placeholder">
                          <span>Photo pending</span>
                        </div>
                      )}
                    </div>
                    {drink.details && (
                      <div className="chultender-details">
                        {drink.details}
                      </div>
                    )}
                    <div className="chultender-order-wrap">
                      <button
                        className="chultender-order-btn"
                        onClick={() => handleOrderClick(drink)}
                      >
                        <span>Order this drink</span>
                        <span>&#8594;</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div className="chultender-footer">
          Chultender.com · Bartending at home
        </div>
      </div>

      {showModal && (
        <div className="chultender-modal-backdrop" onClick={closeModal}>
          <div
            className="chultender-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="chultender-modal-kicker">Order</div>
            <div className="chultender-modal-title">{orderName}</div>
            <div className="chultender-modal-sub">
              Chul will bring it over. Who's it for?
            </div>
            <div className="chultender-modal-body">
              <input
                type="text"
                className="chultender-modal-input"
                placeholder="Please type your name here."
                value={orderBy}
                onChange={(e) => setOrderBy(e.target.value)}
              />
              <div className="chultender-modal-actions">
                <button
                  className="chultender-modal-submit"
                  onClick={submitOrder}
                >
                  Submit
                </button>
                <button
                  className="chultender-modal-cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {sent && (
        <div className="chultender-toast">Order sent — {sentLabel}</div>
      )}
    </div>
  );
}

export default Chultender;

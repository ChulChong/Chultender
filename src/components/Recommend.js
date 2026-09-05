import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Chultender.css";
import "./Recommend.css";
import { backend } from "../lib/backendClient";
import emailjs from "@emailjs/browser";

// Same fixed list AddCocktail.js offers as tag toggles — keep in sync
// with TAG_OPTIONS there if it ever changes.
const TAGS = [
  "Fresh",
  "Strong",
  "Sweet",
  "Sour",
  "Bitter",
  "Fruity",
  "Classic",
  "Light",
  "Creamy",
  "Bubbly",
];

function Recommend() {
  const navigate = useNavigate();
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState(null); // null = All
  const [picked, setPicked] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [orderBy, setOrderBy] = useState("");
  const [sent, setSent] = useState(false);
  const sentTimer = useRef(null);

  useEffect(() => {
    backend.cocktails.list().then(({ data, error }) => {
      if (error) {
        console.error("Failed to load cocktails:", error.message);
      } else {
        setDrinks(data);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => () => clearTimeout(sentTimer.current), []);

  const pool = activeTag ? drinks.filter((d) => (d.tags || []).includes(activeTag)) : drinks;

  const pickOne = () => {
    if (pool.length === 0) return;
    // Avoid repeating the same drink twice in a row when there's more
    // than one option in the pool.
    let next = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && picked && next.id === picked.id) {
      const others = pool.filter((d) => d.id !== picked.id);
      next = others[Math.floor(Math.random() * others.length)];
    }
    setPicked(next);
  };

  const closeModal = () => setShowModal(false);

  const sendEmail = (data) => {
    emailjs
      .send("service_y4u4u9z", "template_kepzcvg", data, "uucLbm7oCkBcst-pE")
      .then(
        (result) => console.log(result.text),
        (error) => console.log(error.text)
      );
  };

  const submitOrder = () => {
    sendEmail({ name: orderBy, drinkname: picked.name });
    setShowModal(false);
    setSent(true);
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
                <span className="chultender-brand-dot" />
                <span className="chultender-brand-name">CHULTENDER</span>
              </div>
              <div className="chultender-tagline">Not sure what to drink?</div>
            </div>
          </div>
          <button className="recommend-back" onClick={() => navigate("/Chultender")}>
            ← Back to menu
          </button>
        </div>

        <div className="recommend-tags">
          <button
            type="button"
            className={`recommend-tag${activeTag === null ? " active" : ""}`}
            onClick={() => setActiveTag(null)}
          >
            All
          </button>
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`recommend-tag${activeTag === tag ? " active" : ""}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="chultender-empty">Loading cocktails…</div>
        ) : pool.length === 0 ? (
          <div className="chultender-empty">
            No drinks tagged &ldquo;{activeTag}&rdquo; yet — try All or another tag.
          </div>
        ) : (
          <div className="recommend-picker">
            <button className="recommend-pick-btn" onClick={pickOne}>
              {picked ? "Pick another" : "Pick a drink for me"}
            </button>
            <div className="recommend-pool-count">
              choosing from {pool.length} drink{pool.length === 1 ? "" : "s"}
              {activeTag ? ` tagged "${activeTag}"` : ""}
            </div>
          </div>
        )}

        {picked && (
          <div className="recommend-result">
            <div className="recommend-result-header">
              <span className="recommend-result-name">{picked.name}</span>
              <span className="chultender-row-base">{picked.base_spirit || "Mixed"}</span>
            </div>
            <div className="chultender-panel-grid">
              <div>
                <div className="chultender-build-label">Build</div>
                {picked.ingredients.map((ingredient, i) => (
                  <div className="chultender-ingredient" key={i}>
                    {ingredient}
                  </div>
                ))}
              </div>
              {picked.image_url ? (
                <div className="chultender-photo-cell">
                  <img className="chultender-photo" src={picked.image_url} alt="" />
                </div>
              ) : (
                <div className="chultender-photo-placeholder">
                  <span>Photo pending</span>
                </div>
              )}
            </div>
            {picked.details && <div className="chultender-details">{picked.details}</div>}
            <div className="chultender-order-wrap">
              <button className="chultender-order-btn" onClick={() => setShowModal(true)}>
                <span>Order this drink</span>
                <span>&#8594;</span>
              </button>
            </div>
          </div>
        )}

        <div className="chultender-footer">Chultender.com · Bartending at home</div>
      </div>

      {showModal && picked && (
        <div className="chultender-modal-backdrop" onClick={closeModal}>
          <div className="chultender-modal" onClick={(e) => e.stopPropagation()}>
            <div className="chultender-modal-kicker">Order</div>
            <div className="chultender-modal-title">{picked.name}</div>
            <div className="chultender-modal-sub">Chul will bring it over. Who's it for?</div>
            <div className="chultender-modal-body">
              <input
                type="text"
                className="chultender-modal-input"
                placeholder="Please type your name here."
                value={orderBy}
                onChange={(e) => setOrderBy(e.target.value)}
              />
              <div className="chultender-modal-actions">
                <button className="chultender-modal-submit" onClick={submitOrder}>
                  Submit
                </button>
                <button className="chultender-modal-cancel" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {sent && <div className="chultender-toast">Order sent — {picked?.name}</div>}
    </div>
  );
}

export default Recommend;

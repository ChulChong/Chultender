import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { backend } from "../lib/backendClient";
import { extractColor, loadImageFromFile } from "../lib/extractColor";
import "./AddCocktail.css";

const CUP_OPTIONS = ["ontherock", "highball", "flute", "coupe", "martini", "julep"];

// Shown as filter chips on /Recommend. A fixed, curated list (not
// derived from ingredients) — same reasoning as base_spirit: the admin
// picks what actually fits the drink instead of a heuristic guessing.
const TAG_OPTIONS = [
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

const BLANK_FORM = {
  name: "",
  details: "",
  cup: CUP_OPTIONS[0],
  isShow: true,
  ingredientLines: [],
  backgroundColor: "#819651",
  fontColor: "#ffffff",
  baseSpirit: "",
  tags: [],
  requiredKeywords: [],
};

const UNIT_OPTIONS = ["oz", "ml", "fill"];
const ML_PER_OZ = 29.5735;

// Formats an oz amount the way the rest of the ingredient list already
// reads (a plain number, not a fraction) — "1.5", "2", "0.75" — trimming
// floating-point noise from the ml->oz conversion.
function formatOz(oz) {
  const rounded = Math.round(oz * 100) / 100;
  return String(rounded);
}

// Builds one ingredient line from the structured composer (name + amount
// + unit) below the ingredient list. "fill" ingredients (soda, tonic,
// coke, ...) have no measured amount — just "<Name> Fill", matching the
// existing data's convention (e.g. "Soda Fill"). "ml" is converted to oz
// before being stored, so every measured line ends up in the same unit
// regardless of how the admin entered it.
function composeIngredientLine(name, amount, unit) {
  const trimmedName = name.trim();
  if (!trimmedName) return null;
  if (unit === "fill") {
    return `${trimmedName} Fill`;
  }
  const amountNum = parseFloat(amount);
  if (!amountNum || amountNum <= 0) return null;
  const oz = unit === "ml" ? amountNum / ML_PER_OZ : amountNum;
  return `${formatOz(oz)} oz ${trimmedName}`;
}

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Strips a leading amount ("2", "1 1/2", "3/4 oz", "1 dash", ...) off an
// ingredient line to suggest a clean base-spirit label when the admin
// marks that line as the base — e.g. "2 oz Bourbon" -> "Bourbon". Just a
// starting point: the Base spirit field stays a plain text input, so a
// suggestion that comes out oddly (or none, if the line has no leading
// amount) can be edited or typed by hand either way.
function suggestBaseLabel(line) {
  const trimmed = (line || "").trim();
  const match = trimmed.match(
    /^[\d./\s]+\s*(oz|ml|cl|tsp|tbsp|dash(?:es)?|drop(?:s)?|splash(?:es)?|gram(?:s)?|cup(?:s)?|part(?:s)?|pinch(?:es)?|whole)?\.?\s*/i
  );
  const rest = match ? trimmed.slice(match[0].length).trim() : trimmed;
  return rest || trimmed;
}

// Cocktail Admin — add new cocktails or edit any existing one. Existing
// ingredient strings (e.g. "2 oz Bourbon") are edited as plain text lines
// rather than forced back through the keyword-chip picker, since they
// weren't necessarily built from a keyword in the first place; the chip
// row is still there as a quick way to insert a known ingredient name.
const AddCocktail = () => {
  const navigate = useNavigate();

  const [cocktails, setCocktails] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listSearch, setListSearch] = useState("");
  const [hiddenOnly, setHiddenOnly] = useState(false);
  // Collapsed by default — only visually meaningful on narrow viewports
  // (see .admin-list-toggle / .admin-list-body in AddCocktail.css); the
  // desktop layout ignores this and always shows the full sidebar.
  const [listOpen, setListOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = adding a new cocktail
  // Swaps the right-hand panel for the Bar Inventory checklist instead of
  // the cocktail form — see the "🍸 Bar Inventory" button below.
  const [showInventory, setShowInventory] = useState(false);

  const [form, setForm] = useState(BLANK_FORM);
  // Which ingredient line's "Base" radio is checked — purely for
  // highlighting the right radio; the actual value lives in
  // form.baseSpirit (a plain text field the admin can still edit by
  // hand after picking a line, or instead of picking one at all).
  const [baseLineIndex, setBaseLineIndex] = useState(null);

  // The structured "name / amount / unit" composer that builds a single
  // ingredient line (see composeIngredientLine above) instead of typing
  // the whole thing freehand.
  const [composerName, setComposerName] = useState("");
  const [composerAmount, setComposerAmount] = useState("");
  const [composerUnit, setComposerUnit] = useState("oz");
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  const [keywords, setKeywords] = useState([]);
  const [keywordSearch, setKeywordSearch] = useState("");
  const [newKeywordName, setNewKeywordName] = useState("");
  const [addingKeyword, setAddingKeyword] = useState(false);
  // Bar Inventory panel — checkbox toggles only update this local state;
  // nothing hits the API until "Save inventory" is clicked (one request
  // per changed ingredient, not one per click). savedOwnedIds is the
  // last-known-saved baseline, used to figure out what's actually dirty.
  const [savedOwnedIds, setSavedOwnedIds] = useState(new Set());
  const [savingInventory, setSavingInventory] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchCocktails = async () => {
    // all=true: the admin list should show hidden cocktails too, not just
    // the ones the public /Chultender menu shows.
    const { data, error: fetchError } = await backend.cocktails.list(true);
    if (fetchError) {
      console.error("Failed to load cocktails:", fetchError.message);
    } else {
      setCocktails([...data].sort((a, b) => a.name.localeCompare(b.name)));
    }
    setLoadingList(false);
  };

  useEffect(() => {
    fetchCocktails();
    backend.ingredientKeywords.list().then(({ data, error: fetchError }) => {
      if (fetchError) {
        console.error("Failed to load ingredient keywords:", fetchError.message);
      } else {
        setKeywords(data);
        setSavedOwnedIds(new Set(data.filter((k) => k.is_owned).map((k) => k.id)));
      }
    });
  }, []);

  const filteredCocktails = useMemo(() => {
    const q = listSearch.trim().toLowerCase();
    return cocktails.filter((c) => {
      if (hiddenOnly && c.is_show) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [cocktails, listSearch, hiddenOnly]);

  const filteredKeywords = useMemo(() => {
    const q = keywordSearch.trim().toLowerCase();
    if (!q) return keywords;
    return keywords.filter((k) => k.name.toLowerCase().includes(q));
  }, [keywords, keywordSearch]);

  const resetForm = () => {
    setEditingId(null);
    setForm(BLANK_FORM);
    setBaseLineIndex(null);
    setComposerName("");
    setComposerAmount("");
    setComposerUnit("oz");
    setExistingImageUrl(null);
    setImageFile(null);
    setPreviewUrl(null);
    setError(null);
    setSuccess(null);
    setListOpen(false);
    setShowInventory(false);
  };

  const selectCocktail = (cocktail) => {
    setEditingId(cocktail.id);
    setForm({
      name: cocktail.name,
      details: cocktail.details || "",
      cup: cocktail.cup || CUP_OPTIONS[0],
      isShow: !!cocktail.is_show,
      ingredientLines: [...(cocktail.ingredients || [])],
      backgroundColor: cocktail.background_color || "#819651",
      fontColor: cocktail.font_color || "#ffffff",
      baseSpirit: cocktail.base_spirit || "",
      tags: [...(cocktail.tags || [])],
      requiredKeywords: [...(cocktail.required_keywords || [])],
    });
    setBaseLineIndex(null);
    setComposerName("");
    setComposerAmount("");
    setComposerUnit("oz");
    setExistingImageUrl(cocktail.image_url || null);
    setImageFile(null);
    setPreviewUrl(null);
    setError(null);
    setSuccess(null);
    setListOpen(false);
    setShowInventory(false);
  };

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleTag = (tag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  };

  // Which ingredient-keyword ids this drink needs to be makeable — see
  // the "Required ingredients" section below. Chultender.js hides the
  // drink unless every id here is checked off in the Bar Inventory panel.
  const toggleRequiredKeyword = (keywordId) => {
    setForm((prev) => ({
      ...prev,
      requiredKeywords: prev.requiredKeywords.includes(keywordId)
        ? prev.requiredKeywords.filter((k) => k !== keywordId)
        : [...prev.requiredKeywords, keywordId],
    }));
  };

  // Bar Inventory panel — flips the checkbox locally only. Nothing is
  // sent to the API until "Save inventory" is clicked, so ticking a run
  // of boxes doesn't fire a request per click.
  const toggleOwnedLocal = (keywordId) => {
    setKeywords((prev) =>
      prev.map((k) => (k.id === keywordId ? { ...k, is_owned: !k.is_owned } : k))
    );
  };

  const dirtyKeywords = useMemo(
    () => keywords.filter((k) => !!k.is_owned !== savedOwnedIds.has(k.id)),
    [keywords, savedOwnedIds]
  );

  const saveInventory = async () => {
    if (dirtyKeywords.length === 0) return;
    setSavingInventory(true);
    setError(null);
    setSuccess(null);

    const results = await Promise.all(
      dirtyKeywords.map((k) => backend.ingredientKeywords.setOwned(k.id, !!k.is_owned))
    );
    const failed = dirtyKeywords.filter((_, i) => results[i].error);

    setSavedOwnedIds((prev) => {
      const next = new Set(prev);
      dirtyKeywords.forEach((k, i) => {
        if (results[i].error) return; // leave failed ones dirty, retry-able
        if (k.is_owned) next.add(k.id);
        else next.delete(k.id);
      });
      return next;
    });

    if (failed.length > 0) {
      setError(`Couldn't save: ${failed.map((k) => k.name).join(", ")}`);
    } else {
      setSuccess("Bar inventory saved.");
    }
    setSavingInventory(false);
  };

  const updateLine = (index, value) => {
    setForm((prev) => {
      const lines = [...prev.ingredientLines];
      lines[index] = value;
      // Keep the suggested base-spirit label in sync while the admin is
      // still typing the line they marked as the base.
      const baseSpirit = index === baseLineIndex ? suggestBaseLabel(value) : prev.baseSpirit;
      return { ...prev, ingredientLines: lines, baseSpirit };
    });
  };

  const removeLine = (index) => {
    setForm((prev) => ({
      ...prev,
      ingredientLines: prev.ingredientLines.filter((_, i) => i !== index),
    }));
    setBaseLineIndex((prev) => {
      if (prev === null) return prev;
      if (prev === index) return null;
      return prev > index ? prev - 1 : prev;
    });
  };

  const markBaseLine = (index) => {
    setBaseLineIndex(index);
    updateField("baseSpirit", suggestBaseLabel(form.ingredientLines[index]));
  };

  const addLine = (text = "") => {
    setForm((prev) => ({ ...prev, ingredientLines: [...prev.ingredientLines, text] }));
  };

  const handleAddComposedLine = () => {
    const line = composeIngredientLine(composerName, composerAmount, composerUnit);
    if (!line) return;
    addLine(line);
    setComposerName("");
    setComposerAmount("");
    setComposerUnit("oz");
  };

  const handleAddKeyword = async () => {
    const trimmed = newKeywordName.trim();
    if (!trimmed) return;
    const id = slugify(trimmed);
    if (!id) return;

    setAddingKeyword(true);
    try {
      // The backend treats a duplicate id as success (returns the existing
      // row) rather than an error, matching this form's original behavior.
      const { data, error: insertError } = await backend.ingredientKeywords.create(trimmed);
      if (insertError) throw new Error(insertError.message);

      setKeywords((prev) =>
        prev.some((k) => k.id === data.id)
          ? prev
          : [...prev, data].sort((a, b) => a.name.localeCompare(b.name))
      );
      setNewKeywordName("");
    } catch (e) {
      setError(e.message || "Couldn't add that keyword.");
    } finally {
      setAddingKeyword(false);
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    try {
      const image = await loadImageFromFile(file);
      setPreviewUrl(image.src);
      const colors = extractColor(image);
      updateField("backgroundColor", colors.backgroundColor);
      updateField("fontColor", colors.fontColor);
    } catch (e) {
      console.error("Couldn't read that image:", e);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedName = form.name.trim();
    const cleanIngredients = form.ingredientLines.map((l) => l.trim()).filter(Boolean);

    if (!trimmedName) {
      setError("Give the cocktail a name.");
      return;
    }
    if (cleanIngredients.length === 0) {
      setError("Add at least one ingredient line.");
      return;
    }

    const id = editingId || slugify(trimmedName);
    if (!id) {
      setError("That name doesn't produce a usable id — try adding a letter or number.");
      return;
    }

    if (imageFile && !isSupabaseConfigured) {
      setError(
        "Supabase isn't configured yet — copy .env.local.example to .env.local, fill in your project's URL/anon key, and restart the dev server (needed for photo uploads)."
      );
      return;
    }

    setSubmitting(true);
    try {
      // Photo storage still goes straight to Supabase Storage — the
      // Spring Boot backend only handles cocktail/keyword metadata, not
      // file uploads.
      let imageUrl = existingImageUrl;
      if (imageFile) {
        const extension = imageFile.name.split(".").pop() || "png";
        const path = `${id}-${Date.now()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("cocktail-photos")
          .upload(path, imageFile);
        if (uploadError) throw uploadError;
        imageUrl = supabase.storage.from("cocktail-photos").getPublicUrl(path).data.publicUrl;
      }

      const payload = {
        name: trimmedName,
        ingredients: cleanIngredients,
        details: form.details.trim(),
        cup: form.cup,
        image_url: imageUrl,
        background_color: form.backgroundColor,
        font_color: form.fontColor,
        is_show: form.isShow,
        base_spirit: form.baseSpirit.trim() || "Mixed",
        tags: form.tags,
        required_keywords: form.requiredKeywords,
      };

      if (editingId) {
        // Cocktail.id is @NotBlank-validated on the way in, so the PUT
        // body needs it even though the path variable is authoritative.
        const { error: updateError } = await backend.cocktails.update(editingId, {
          id: editingId,
          ...payload,
        });
        if (updateError) throw new Error(updateError.message);
        setSuccess(`"${trimmedName}" updated.`);
        setImageFile(null);
        setPreviewUrl(null);
        setExistingImageUrl(imageUrl);
      } else {
        const { error: insertError } = await backend.cocktails.create({ id, ...payload });
        if (insertError) throw new Error(insertError.message);
        resetForm();
        setSuccess(`"${trimmedName}" added.`);
      }

      fetchCocktails();
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const photoSrc = previewUrl || existingImageUrl;

  return (
    <div className="add-cocktail">
      <h1>Cocktail Admin</h1>
      <Button variant="link" onClick={() => navigate("/Chultender")} className="add-cocktail-back">
        ← Back to menu
      </Button>

      <div className="admin-layout">
        <div className="admin-list">
          <button
            type="button"
            className="admin-list-toggle"
            onClick={() => setListOpen((open) => !open)}
          >
            <span className="admin-list-toggle-label">
              <span className="admin-list-toggle-title">Cocktails</span>
              <span className="admin-list-toggle-count">
                {filteredCocktails.length} of {cocktails.length}
              </span>
            </span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className={`admin-list-toggle-chevron${listOpen ? " open" : ""}`}
            >
              <path
                d="M6 9l6 6 6-6"
                stroke="#495057"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className={`admin-list-body${listOpen ? "" : " collapsed"}`}>
            <Form.Control
              size="sm"
              placeholder="Search cocktails…"
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              className="admin-list-search"
            />
            <Form.Check
              type="checkbox"
              id="admin-hidden-only"
              label="Hidden only"
              checked={hiddenOnly}
              onChange={(e) => setHiddenOnly(e.target.checked)}
              className="admin-hidden-only"
            />
            <Button
              variant={editingId === null && !showInventory ? "primary" : "outline-secondary"}
              size="sm"
              className="admin-new-btn"
              onClick={resetForm}
            >
              + New cocktail
            </Button>
            <Button
              variant={showInventory ? "primary" : "outline-secondary"}
              size="sm"
              className="admin-new-btn"
              onClick={() => setShowInventory(true)}
            >
              🍸 Bar Inventory
            </Button>
            {loadingList ? (
              <p className="admin-list-status">Loading…</p>
            ) : (
              <ul className="admin-list-items">
                {filteredCocktails.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className={`admin-list-item${editingId === c.id ? " active" : ""}`}
                      onClick={() => selectCocktail(c)}
                    >
                      {c.name}
                      {!c.is_show && <span className="admin-list-hidden"> (hidden)</span>}
                    </button>
                  </li>
                ))}
                {filteredCocktails.length === 0 && (
                  <li className="admin-list-status">No matches.</li>
                )}
              </ul>
            )}
          </div>
        </div>

        {showInventory ? (
          <div className="add-cocktail-form bar-inventory">
            <p className="admin-editing-label">
              Check off what's in your bar. Chultender only shows drinks whose
              ingredients are all checked here.
            </p>
            <Form.Control
              size="sm"
              placeholder="Search ingredients…"
              value={keywordSearch}
              onChange={(e) => setKeywordSearch(e.target.value)}
              className="mb-3"
            />
            <div className="bar-inventory-list">
              {filteredKeywords.map((keyword) => (
                <Form.Check
                  key={keyword.id}
                  type="checkbox"
                  id={`owned-${keyword.id}`}
                  label={keyword.name}
                  checked={!!keyword.is_owned}
                  disabled={savingInventory}
                  onChange={() => toggleOwnedLocal(keyword.id)}
                  className={`bar-inventory-item${
                    dirtyKeywords.some((k) => k.id === keyword.id) ? " dirty" : ""
                  }`}
                />
              ))}
              {filteredKeywords.length === 0 && (
                <span className="ingredient-chips-empty">No matching ingredients.</span>
              )}
            </div>
            {error && <p className="add-cocktail-error">{error}</p>}
            {success && <p className="add-cocktail-success">{success}</p>}
            <div className="admin-form-actions">
              <Button
                type="button"
                onClick={saveInventory}
                disabled={savingInventory || dirtyKeywords.length === 0}
              >
                {savingInventory
                  ? "Saving…"
                  : dirtyKeywords.length > 0
                  ? `Save inventory (${dirtyKeywords.length})`
                  : "Save inventory"}
              </Button>
              <Button variant="outline-secondary" type="button" onClick={() => setShowInventory(false)}>
                ← Back to cocktails
              </Button>
            </div>
          </div>
        ) : (
        <Form onSubmit={handleSubmit} className="add-cocktail-form">
          {editingId && (
            <p className="admin-editing-label">
              Editing <strong>{editingId}</strong>
            </p>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ingredients</Form.Label>
            <div className="ingredient-lines">
              {form.ingredientLines.map((line, i) => (
                <div className="ingredient-line" key={i}>
                  <label className="ingredient-line-base" title="Mark as the base spirit">
                    <input
                      type="radio"
                      name="base-line"
                      checked={baseLineIndex === i}
                      onChange={() => markBaseLine(i)}
                    />
                    <span>Base</span>
                  </label>
                  <Form.Control
                    size="sm"
                    value={line}
                    placeholder="e.g. 2 oz Bourbon"
                    onChange={(e) => updateLine(i, e.target.value)}
                  />
                  <button
                    type="button"
                    className="ingredient-line-remove"
                    onClick={() => removeLine(i)}
                    aria-label="Remove ingredient"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="ingredient-composer">
              <Form.Control
                size="sm"
                placeholder="Ingredient name"
                value={composerName}
                onChange={(e) => setComposerName(e.target.value)}
                className="ingredient-composer-name"
              />
              {composerUnit !== "fill" && (
                <Form.Control
                  size="sm"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Amount"
                  value={composerAmount}
                  onChange={(e) => setComposerAmount(e.target.value)}
                  className="ingredient-composer-amount"
                />
              )}
              <Form.Select
                size="sm"
                value={composerUnit}
                onChange={(e) => setComposerUnit(e.target.value)}
                className="ingredient-composer-unit"
              >
                {UNIT_OPTIONS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </Form.Select>
              <Button variant="outline-secondary" size="sm" onClick={handleAddComposedLine}>
                + Add
              </Button>
            </div>
            {composerUnit === "ml" && composerAmount && (
              <p className="ingredient-composer-hint">
                {composerAmount} ml → {formatOz(parseFloat(composerAmount) / ML_PER_OZ || 0)} oz
              </p>
            )}

            <Form.Group className="mb-3 base-spirit-field">
              <Form.Label>Base spirit</Form.Label>
              <Form.Control
                size="sm"
                value={form.baseSpirit}
                placeholder="e.g. Bourbon — pick the base radio above, or type your own"
                onChange={(e) => updateField("baseSpirit", e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tags (shown as filters on /Recommend)</Form.Label>
              <div className="tag-options">
                {TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`tag-toggle${form.tags.includes(tag) ? " selected" : ""}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Required ingredients (checked against the Bar Inventory panel —
                hides this drink from Chultender when any are missing)
              </Form.Label>
              <div className="tag-options">
                {keywords.map((keyword) => (
                  <button
                    key={keyword.id}
                    type="button"
                    className={`tag-toggle${
                      form.requiredKeywords.includes(keyword.id) ? " selected" : ""
                    }`}
                    onClick={() => toggleRequiredKeyword(keyword.id)}
                  >
                    {keyword.name}
                  </button>
                ))}
              </div>
            </Form.Group>

            <Form.Control
              size="sm"
              placeholder="Search ingredients…"
              value={keywordSearch}
              onChange={(e) => setKeywordSearch(e.target.value)}
              className="ingredient-chip-search"
            />
            <div className="ingredient-chips">
              {filteredKeywords.map((keyword) => (
                <button
                  key={keyword.id}
                  type="button"
                  className="ingredient-chip-toggle"
                  onClick={() => setComposerName(keyword.name)}
                  title="Fill in the ingredient composer below"
                >
                  + {keyword.name}
                </button>
              ))}
              {filteredKeywords.length === 0 && (
                <span className="ingredient-chips-empty">No matching ingredients.</span>
              )}
            </div>

            <div className="ingredient-add-new">
              <Form.Control
                size="sm"
                placeholder="Not in the list? Type a new ingredient…"
                value={newKeywordName}
                onChange={(e) => setNewKeywordName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
              />
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleAddKeyword}
                disabled={addingKeyword || !newKeywordName.trim()}
              >
                + Add keyword
              </Button>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Details</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={form.details}
              onChange={(e) => updateField("details", e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Glass</Form.Label>
            <Form.Select value={form.cup} onChange={(e) => updateField("cup", e.target.value)}>
              {CUP_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Photo</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
            {photoSrc && (
              <div className="add-cocktail-preview">
                <img src={photoSrc} alt="Preview" />
                <div className="add-cocktail-swatches">
                  <label>
                    Background
                    <input
                      type="color"
                      value={form.backgroundColor}
                      onChange={(e) => updateField("backgroundColor", e.target.value)}
                    />
                  </label>
                  <label>
                    Text
                    <input
                      type="color"
                      value={form.fontColor}
                      onChange={(e) => updateField("fontColor", e.target.value)}
                    />
                  </label>
                  <div
                    className="add-cocktail-swatch-preview"
                    style={{ backgroundColor: form.backgroundColor, color: form.fontColor }}
                  >
                    {form.name || "Preview"}
                  </div>
                </div>
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Show on the menu"
              checked={form.isShow}
              onChange={(e) => updateField("isShow", e.target.checked)}
            />
          </Form.Group>

          {error && <p className="add-cocktail-error">{error}</p>}
          {success && <p className="add-cocktail-success">{success}</p>}

          <div className="admin-form-actions">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : editingId ? "Save changes" : "Add cocktail"}
            </Button>
            {editingId && (
              <Button variant="outline-secondary" type="button" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </Form>
        )}
      </div>
    </div>
  );
};

export default AddCocktail;

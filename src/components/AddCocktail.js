import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { extractColor, loadImageFromFile } from "../lib/extractColor";
import "./AddCocktail.css";

const CUP_OPTIONS = ["ontherock", "highball", "flute", "coupe", "martini", "julep"];

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const AddCocktail = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [cup, setCup] = useState(CUP_OPTIONS[0]);
  const [isShow, setIsShow] = useState(true);

  // Ingredients are toggled keyword chips (backed by the
  // `ingredient_keywords` table) with a free-text amount per selection —
  // { [keywordId]: amountString }. Composed into the same
  // "amount name" strings the rest of the app already expects on submit.
  const [keywords, setKeywords] = useState([]);
  const [selected, setSelected] = useState({});
  const [newKeywordName, setNewKeywordName] = useState("");
  const [addingKeyword, setAddingKeyword] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState("#819651");
  const [fontColor, setFontColor] = useState("#ffffff");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase
      .from("ingredient_keywords")
      .select("*")
      .order("name")
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          console.error("Failed to load ingredient keywords:", fetchError.message);
        } else {
          setKeywords(data);
        }
      });
  }, []);

  const toggleKeyword = (keyword) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (keyword.id in next) {
        delete next[keyword.id];
      } else {
        next[keyword.id] = "";
      }
      return next;
    });
  };

  const setKeywordAmount = (id, amount) => {
    setSelected((prev) => ({ ...prev, [id]: amount }));
  };

  const handleAddKeyword = async () => {
    if (!isSupabaseConfigured) return;
    const trimmed = newKeywordName.trim();
    if (!trimmed) return;
    const id = slugify(trimmed);
    if (!id) return;

    setAddingKeyword(true);
    try {
      const { error: insertError } = await supabase
        .from("ingredient_keywords")
        .insert({ id, name: trimmed });
      if (insertError && insertError.code !== "23505") throw insertError; // ignore "already exists"

      setKeywords((prev) =>
        prev.some((k) => k.id === id)
          ? prev
          : [...prev, { id, name: trimmed }].sort((a, b) => a.name.localeCompare(b.name))
      );
      setSelected((prev) => ({ ...prev, [id]: prev[id] ?? "" }));
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
      setBackgroundColor(colors.backgroundColor);
      setFontColor(colors.fontColor);
    } catch (e) {
      console.error("Couldn't read that image:", e);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!isSupabaseConfigured) {
      setError(
        "Supabase isn't configured yet — copy .env.local.example to .env.local, fill in your project's URL/anon key, and restart the dev server."
      );
      return;
    }

    const trimmedName = name.trim();
    const cleanIngredients = Object.entries(selected)
      .map(([id, amount]) => {
        const keyword = keywords.find((k) => k.id === id);
        if (!keyword) return null;
        const trimmedAmount = amount.trim();
        return trimmedAmount ? `${trimmedAmount} ${keyword.name}` : keyword.name;
      })
      .filter(Boolean);

    if (!trimmedName) {
      setError("Give the cocktail a name.");
      return;
    }
    if (cleanIngredients.length === 0) {
      setError("Pick at least one ingredient.");
      return;
    }

    const id = slugify(trimmedName);
    if (!id) {
      setError("That name doesn't produce a usable id — try adding a letter or number.");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        const extension = imageFile.name.split(".").pop() || "png";
        const path = `${id}-${Date.now()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("cocktail-photos")
          .upload(path, imageFile);
        if (uploadError) throw uploadError;
        imageUrl = supabase.storage.from("cocktail-photos").getPublicUrl(path).data.publicUrl;
      }

      const { error: insertError } = await supabase.from("cocktails").insert({
        id,
        name: trimmedName,
        ingredients: cleanIngredients,
        details: details.trim(),
        cup,
        image_url: imageUrl,
        background_color: backgroundColor,
        font_color: fontColor,
        is_show: isShow,
      });
      if (insertError) {
        if (insertError.code === "23505") {
          throw new Error(`A cocktail named "${trimmedName}" already exists.`);
        }
        throw insertError;
      }

      setSuccess(true);
      setName("");
      setSelected({});
      setDetails("");
      setCup(CUP_OPTIONS[0]);
      setImageFile(null);
      setPreviewUrl(null);
      setBackgroundColor("#819651");
      setFontColor("#ffffff");
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-cocktail">
      <h1>Add a cocktail</h1>
      <Button variant="link" onClick={() => navigate("/Chultender")} className="add-cocktail-back">
        ← Back to menu
      </Button>

      <Form onSubmit={handleSubmit} className="add-cocktail-form">
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control value={name} onChange={(e) => setName(e.target.value)} required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Ingredients</Form.Label>
          <div className="ingredient-chips">
            {keywords.map((keyword) => {
              const isSelected = keyword.id in selected;
              return (
                <div key={keyword.id} className="ingredient-chip">
                  <button
                    type="button"
                    className={`ingredient-chip-toggle${isSelected ? " selected" : ""}`}
                    onClick={() => toggleKeyword(keyword)}
                  >
                    {keyword.name}
                  </button>
                  {isSelected && (
                    <input
                      className="ingredient-chip-amount"
                      placeholder="amount (e.g. 2 oz)"
                      value={selected[keyword.id]}
                      onChange={(e) => setKeywordAmount(keyword.id, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
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
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Glass</Form.Label>
          <Form.Select value={cup} onChange={(e) => setCup(e.target.value)}>
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
          {previewUrl && (
            <div className="add-cocktail-preview">
              <img src={previewUrl} alt="Preview" />
              <div className="add-cocktail-swatches">
                <label>
                  Background
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                  />
                </label>
                <label>
                  Text
                  <input
                    type="color"
                    value={fontColor}
                    onChange={(e) => setFontColor(e.target.value)}
                  />
                </label>
                <div
                  className="add-cocktail-swatch-preview"
                  style={{ backgroundColor, color: fontColor }}
                >
                  {name || "Preview"}
                </div>
              </div>
            </div>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label="Show on the menu"
            checked={isShow}
            onChange={(e) => setIsShow(e.target.checked)}
          />
        </Form.Group>

        {error && <p className="add-cocktail-error">{error}</p>}
        {success && <p className="add-cocktail-success">Cocktail added!</p>}

        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Add cocktail"}
        </Button>
      </Form>
    </div>
  );
};

export default AddCocktail;

// Client for the Spring Boot backend (spring-backend/) — a plain REST API
// in front of the same Supabase Postgres database the app used to call
// directly. Deployed on an Oracle Cloud VM behind Caddy (auto HTTPS) at
// api.chultender.com. Field names in request/response bodies are
// snake_case (image_url, background_color, ...) to match what the app
// already spoke when it called Supabase's PostgREST directly — see the
// @JsonProperty overrides in Cocktail.java.
const API_BASE =
  process.env.REACT_APP_BACKEND_URL || "https://api.chultender.com/api";

async function request(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (res.status === 204) return { data: null, error: null };

    const text = await res.text();
    let body = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text; // controller returned a plain-text error message
      }
    }

    if (!res.ok) {
      const message =
        (body && typeof body === "object" && body.error) ||
        (typeof body === "string" && body) ||
        `Request failed (${res.status})`;
      return { data: null, error: { message } };
    }
    return { data: body, error: null };
  } catch (e) {
    return {
      data: null,
      error: { message: e.message || "Couldn't reach the backend." },
    };
  }
}

export const backend = {
  cocktails: {
    list: (all = false) => request(`/cocktails${all ? "?all=true" : ""}`),
    create: (payload) =>
      request(`/cocktails`, { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) =>
      request(`/cocktails/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    remove: (id) =>
      request(`/cocktails/${encodeURIComponent(id)}`, { method: "DELETE" }),
  },
  ingredientKeywords: {
    list: () => request(`/ingredient-keywords`),
    create: (name) =>
      request(`/ingredient-keywords`, {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    // Bar Inventory panel in AddCocktail.js — marks whether the admin
    // currently has this ingredient on hand.
    setOwned: (id, isOwned) =>
      request(`/ingredient-keywords/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ is_owned: isOwned }),
      }),
  },
  admin: {
    // The actual password lives only in the backend's gitignored
    // application-local.properties — never in this bundle.
    verify: (password) =>
      request(`/admin/verify`, {
        method: "POST",
        body: JSON.stringify({ password }),
      }),
  },
};

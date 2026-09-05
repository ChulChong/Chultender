# chultender-backend (Spring Boot, exploratory)

An alternative REST API for the `cocktails` and `ingredient_keywords`
tables, built to answer "could this run on Spring Boot instead of calling
Supabase directly from the browser?" It connects straight to the **same
Supabase Postgres database**
the React app already uses (see `../src/lib/supabaseClient.js`) — same
data, same rows, no migration needed. It is **not wired into the React
app** — `Chultender.js` still talks to Supabase directly. This is a
parallel API to poke at.

## Setup

1. Copy the password file and fill in the real Supabase DB password
   (Supabase dashboard → Project Settings → Database → Connection string).
   The same password already used for Supabase's own Postgres connection
   works here — Spring Boot is just another Postgres client.
   ```bash
   cp src/main/resources/application-local.properties.example \
      src/main/resources/application-local.properties
   # then edit spring.datasource.password= in that file
   ```
   `application-local.properties` is gitignored — it never gets committed.

2. Run it:
   ```bash
   mvn spring-boot:run
   ```
   Starts on `http://localhost:8080`.

## Endpoints

| Method | Path                    | Notes                                             |
| ------ | ----------------------- | -------------------------------------------------- |
| GET    | `/api/cocktails`        | Visible drinks only, by name (matches the app's default query). Add `?all=true` for every row. |
| GET    | `/api/cocktails/{id}`   | 404 if missing.                                   |
| POST   | `/api/cocktails`        | Body matches the DB columns (camelCase — see `Cocktail.java`). `id` auto-slugified from `name` if omitted. 409 on duplicate id. |
| PUT    | `/api/cocktails/{id}`   | Full replace.                                     |
| DELETE | `/api/cocktails/{id}`   | Actually deletes — connecting as the `postgres` role bypasses Supabase's Row Level Security entirely, unlike the anon-key client the React app uses (which has no DELETE policy on this table today). |

| Method | Path                              | Notes                                             |
| ------ | --------------------------------- | -------------------------------------------------- |
| GET    | `/api/ingredient-keywords`        | All keywords, ordered by name.                     |
| POST   | `/api/ingredient-keywords`        | Body: `{"name": "..."}` (`id` optional, auto-slugified from `name`). Duplicate id returns the existing row instead of erroring — matches the app's current "ignore 23505" behavior for this table. |
| DELETE | `/api/ingredient-keywords/{id}`   | Actually deletes — same DELETE-bypasses-RLS story as `cocktails` above; the anon-key client has no DELETE policy on this table either. 404 if missing. |

CORS is wide open (`@CrossOrigin(origins = "*")`), matching the rest of
this project's no-auth design.

## Why a separate connection, not Supabase's REST/JS client

This talks to Postgres directly over JDBC (`spring-boot-starter-data-jpa`
+ the `postgresql` driver) rather than through Supabase's PostgREST/anon
key layer. That means:
- No RLS — every operation runs with full table access (see the DELETE
  point above). Fine for local exploration; would need real auth before
  this ever faced the internet.
- `ingredients` (Postgres `text[]`) maps straight to a Java `String[]`
  via Hibernate 6's built-in array support (`@JdbcTypeCode(SqlTypes.ARRAY)`
  in `Cocktail.java`) — no extra library needed.

## If this were to replace Supabase calls in the app

Not done here, but the path would be: point `Chultender.js` /
`AddCocktail.js` at `http://localhost:8080/api/cocktails` (or wherever
this is deployed) instead of `supabase.from("cocktails")`, and deploy
this Spring Boot app somewhere that can hold a long-lived process (e.g.
Railway, Render, Fly.io — not Firebase Hosting, which only serves static
files). Supabase would stay as the Postgres host either way, or could be
swapped for any other Postgres instance since nothing here is
Supabase-specific beyond the connection string.

# chultender-backend

The API `Chultender.js` and `AddCocktail.js` use for cocktails and
ingredient keywords (`../src/lib/backendClient.js`), in place of calling
Supabase's PostgREST directly. It connects straight to the **same
Supabase Postgres database** the app always used — same data, same rows,
no migration happened, this is just a different door into the same
table. Started as an exploratory "could this run on Spring Boot instead"
detour; now it's live in production.

Photo uploads are the one thing still going straight to Supabase Storage
from the browser (`AddCocktail.js`) — this API has no file-upload
endpoint.

Deployed 24/7 on a free-tier Oracle Cloud VM, reachable at
`https://api.chultender.com` — see "Deployment" below.

## Setup

1. Copy the password file and fill in the real Supabase DB password
   (Supabase dashboard → Connect → Direct, same password works for the
   session pooler too — it's the same Postgres role).
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

### Why the session pooler, not a direct connection

`spring.datasource.url` in `application.properties` points at Supabase's
**session pooler** (`aws-0-us-east-2.pooler.supabase.com:5432`, user
`postgres.<project-ref>`), not the direct host (`db.<project-ref>.
supabase.co`). Supabase's direct connection is **IPv6-only** unless you
pay for the dedicated-IPv4 add-on. That's invisible from most laptops
(they have working IPv6), but it broke outright on the Oracle Cloud VM
below, which has no outbound IPv6 route — `Network is unreachable` on
every query. The session pooler is IPv4-reachable and needs no add-on;
grab it from Supabase's "Connect" dialog → Direct tab → Connection
Method → **Session pooler**.

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

| Method | Path                | Notes                                             |
| ------ | ------------------- | -------------------------------------------------- |
| POST   | `/api/admin/verify` | Body: `{"password": "..."}` → `{"ok": true}` or `{"ok": false}`. Backs the hidden `/Admin` entry point in `Chultender.js` (click the brand-dot, enter the password) — checked against `admin.password` in `application-local.properties` so the value never ships in the public JS bundle. Not real auth: no session, no rate limiting, no hashing. |

`cocktails.base_spirit` (text column, e.g. "Bourbon", "Gin", "Mixed")
is set explicitly by the admin in `AddCocktail.js` (a "Base" radio next
to one ingredient line) — not inferred from ingredient text. `POST
/api/cocktails` defaults it to `"Mixed"` if omitted.

`cocktails.tags` (text[] column, e.g. `["Fresh", "Sour"]`) — same
explicit-field pattern, admin-picked from a fixed list in
`AddCocktail.js`, defaults to `[]` on create. Powers the tag filters
on the frontend's `/Recommend` page.

CORS is wide open (`@CrossOrigin(origins = "*")`), matching the rest of
this project's no-auth design.

## Why a separate connection, not Supabase's REST/JS client

This talks to Postgres directly over JDBC (`spring-boot-starter-data-jpa`
+ the `postgresql` driver) rather than through Supabase's PostgREST/anon
key layer. That means:
- No RLS — every operation runs with full table access (see the DELETE
  point above). Fine for local exploration; would need real auth before
  this ever faced real traffic.
- `ingredients` (Postgres `text[]`) maps straight to a Java `String[]`
  via Hibernate 6's built-in array support (`@JdbcTypeCode(SqlTypes.ARRAY)`
  in `Cocktail.java`) — no extra library needed.

## Deployment

Running 24/7 as a systemd service on an Oracle Cloud "Always Free" Compute
instance (Oracle Linux 9, Arm/AMD micro shape — permanently free, unlike
Render/Railway free tiers which sleep or expire).

```
http://<VM public IP>:8080/api/cocktails
http://<VM public IP>:8080/api/ingredient-keywords
```

Setup performed on the VM (`opc` user):
1. `sudo dnf install -y java-21-openjdk-headless`
2. `sudo firewall-cmd --permanent --add-port=8080/tcp && sudo firewall-cmd --reload`
   — the host firewall. Oracle Cloud also has a network-level firewall
   (the VNIC's Network Security Group / the subnet's Security List) that
   needs its own ingress rule for TCP 8080 from `0.0.0.0/0`, added from
   the OCI console.
3. Jar + `application-local.properties` copied to `~/chultender-backend/`
   via `scp`.
4. `/etc/systemd/system/chultender-backend.service`:
   ```ini
   [Unit]
   Description=Chultender Spring Boot backend
   After=network.target

   [Service]
   Type=simple
   User=opc
   WorkingDirectory=/home/opc/chultender-backend
   ExecStart=/usr/bin/java -jar /home/opc/chultender-backend/backend.jar
   Restart=on-failure
   RestartSec=5
   SuccessExitStatus=143

   [Install]
   WantedBy=multi-user.target
   ```
   `WorkingDirectory` matters: Spring Boot auto-loads
   `application-local.properties` from the jar's working directory, so it
   never needs to be baked into the jar or passed as a flag.
5. `sudo systemctl daemon-reload && sudo systemctl enable --now chultender-backend`
   — `enable` makes it survive a VM reboot.

To redeploy after a code change:
```bash
mvn -DskipTests package
scp target/backend-0.0.1-SNAPSHOT.jar opc@<VM IP>:~/chultender-backend/backend.jar
ssh opc@<VM IP> "sudo systemctl restart chultender-backend"
```

Logs: `ssh opc@<VM IP> "sudo journalctl -u chultender-backend -f"`

### HTTPS via Caddy

`chultender.com` is served over HTTPS, so the frontend can't call a plain
`http://<VM IP>:8080` API (browsers block that as mixed content). Caddy
sits in front of the jar as a reverse proxy and gets a free Let's Encrypt
certificate automatically — no config beyond DNS + a `Caddyfile`:

1. Route 53: `A` record `api.chultender.com` → the VM's public IP.
2. Open ports 80 (ACME HTTP-01 challenge) and 443 (HTTPS) the same way
   port 8080 was opened above — firewalld on the VM, plus an OCI Security
   List / NSG ingress rule for both.
3. Install Caddy (Oracle Linux 9: `sudo dnf copr enable -y @caddy/caddy && sudo dnf install -y caddy`).
4. `/etc/caddy/Caddyfile`:
   ```
   api.chultender.com {
       reverse_proxy localhost:8080
   }
   ```
5. `sudo systemctl enable --now caddy` — it requests and auto-renews the
   certificate on its own from then on.

Port 8080 is still open directly too (harmless for this no-auth API, and
handy for debugging), but the app only ever calls the `https://` address.

## Wired into the frontend

`src/lib/backendClient.js` (in the main project) points
`Chultender.js` and `AddCocktail.js` at `https://api.chultender.com/api`
for cocktail and ingredient-keyword reads/writes — Supabase's PostgREST
is no longer in that path. Photo uploads are the exception: they still
go straight to Supabase Storage from the browser, since this API has no
file-upload endpoint. Supabase remains the Postgres host underneath
either way; swapping it for another Postgres instance would only mean
changing the connection string here, nothing in the frontend.

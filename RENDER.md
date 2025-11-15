Deploying to Render
===================

This repository contains a small Express app that uses MySQL. The repo now includes a `Dockerfile` so you can deploy it as a Web Service on Render.

Two supported approaches on Render:

1) Deploy using the provided `Dockerfile` (recommended)
   - In the Render dashboard, choose "New" → "Web Service" → connect your GitHub repo `etnc-dev/xss-ecommerce-demo`.
   - Choose "Dockerfile" as the Environment and the root of the repo as the build context.
   - Render will build the image using the `Dockerfile` and run it.

2) Deploy using the Node environment (no Docker)
   - In Render, choose "New" → "Web Service" → connect repo.
   - Set the Build Command to: `npm ci`
   - Set the Start Command to: `node server.js`

Environment variables (required)
--------------------------------
Set the following environment variables in the Render service settings (Environment → Environment Variables):

- DB_HOST — MySQL host (e.g. `db.example.com`)
- DB_USER — MySQL username
- DB_PASS — MySQL password
- DB_NAME — MySQL database name (e.g. `xss_shop`)
- PORT — optional (Render provides a port automatically; the app uses `process.env.PORT`)

Using a managed MySQL provider
------------------------------
Render does not provide managed MySQL in all plans. You can use a third-party managed MySQL provider such as PlanetScale, ClearDB, or Amazon RDS.

Example (PlanetScale)
1. Create a database on PlanetScale.
2. Create a password/branch and obtain the host, username, and password (connection string).
3. Set DB_HOST, DB_USER, DB_PASS, DB_NAME in Render using those values.

Database initialization
-----------------------
This app expects tables `products` and `reviews`. You can initialize them yourself by connecting to the DB and running SQL from `scripts/` (not included). For testing, you can populate sample data manually.

Security note
-------------
This project is intentionally vulnerable (XSS examples). Do not use production credentials or expose sensitive data. Consider sanitizing inputs or restricting access if you deploy publicly.

Troubleshooting
---------------
- If the service crashes, check Render logs for errors connecting to the DB.
- Make sure network access from Render to your DB provider is allowed (some providers require IP allowlists).

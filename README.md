# xss-ecommerce-demo

A simple demo e-commerce site (local Node server + static views). This repo is intended for local development and demonstration.

Contents
- `server.js` — Express-like server script
- `public/` — static assets (CSS)
- `views/` — HTML views for product, search, checkout, etc.

How to run locally

1. Install dependencies (if any):

```bash
npm install
```

2. Start the server:

```bash
node server.js
```

3. Open http://localhost:3000 (or the port in `server.js`).

Deploying to GitHub

I will initialize a local git repo and (if you have the GitHub CLI `gh` installed and authenticated) attempt to create a remote repo and push. If `gh` is not available or not authenticated, use the manual steps below.

Manual GitHub setup (if `gh` isn't available):

1. Create a new repository on GitHub (name: `xss-ecommerce-demo`).
2. On your machine, add the remote and push:

```bash
# replace <URL> with the GitHub repo URL you created
git remote add origin <URL>
# if your default branch is main
git push -u origin main
# or, if your default branch is master
git push -u origin master
```

Notes
- This project contains demo files intended to illustrate XSS vectors — be careful exposing it publicly if you don't want that content visible.
- If you want GitHub Pages, let me know whether you prefer `main` root page or `gh-pages` branch and I can add a workflow.

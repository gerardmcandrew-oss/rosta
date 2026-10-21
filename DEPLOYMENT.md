# Deploying to GitHub Pages

The site is static. A GitHub Actions workflow (`.github/workflows/deploy.yml`) runs on every push to `main`. It installs dependencies, runs the unit tests, builds with the right base path and publishes `dist/` to GitHub Pages.

## One-time setup

1. Create a repository on GitHub, for example `rosta`. It can be public or private, but Pages on a private repository needs a paid plan.
2. Push this project:

   ```bash
   git add -A
   git commit -m "Rosta prototype"
   git branch -M main
   git remote add origin https://github.com/<your-username>/rosta.git
   git push -u origin main
   ```

   With the GitHub CLI you can do steps 1 and 2 together:

   ```bash
   gh repo create rosta --public --source=. --push
   ```

3. On GitHub, open **Settings, Pages** and set **Source** to **GitHub Actions**. With the CLI:

   ```bash
   gh api -X POST repos/<your-username>/rosta/pages -f build_type=workflow
   ```

4. Watch the run under **Actions**, or with `gh run watch`. When it finishes, the site is at:

   - Landing page: `https://<your-username>.github.io/rosta/`
   - Demo: `https://<your-username>.github.io/rosta/demo/`

   Open both links to confirm they work before you share them.

## How the base path works

GitHub Pages serves a project site from `/<repository-name>/`. The workflow sets `BASE_PATH=/<repository-name>/`, and `vite.config.ts` passes that to Vite, so every script, stylesheet and image resolves correctly. If you rename the repository, the next deployment picks up the new name automatically.

The landing page and the demo are separate HTML files (`index.html` and `demo/index.html`). Refreshing `/rosta/demo/` therefore loads a real file, and no single-page-app 404 workaround is needed. Demo sections use the URL hash (`#rota`, `#requests`), which also survives a refresh.

## Building locally for a subpath

```bash
BASE_PATH=/rosta/ npm run build
BASE_PATH=/rosta/ npx vite preview   # http://localhost:4173/rosta/
```

The Playwright tests use the same build (`npm run test:e2e`).

## Data and privacy

The demo saves changes in the visitor's browser (`localStorage`) only. Nothing goes to a server. The early-access form validates input in the browser and sends nothing.

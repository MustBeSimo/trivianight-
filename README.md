# Trivia Night Scoreboard

A lightweight, no-backend dashboard for running trivia night scores in the browser.

## Local usage

Open `index.html` directly in a browser, or run a quick local server:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deploy to GitHub Pages

Yes — this app can be hosted on GitHub Pages (no Vercel required).

### 1) Push to GitHub

```bash
git remote add origin <your-repo-url>
git push -u origin main
```

### 2) Enable Pages in GitHub

- Go to **Settings → Pages**.
- Ensure **Build and deployment** uses **GitHub Actions**.
- The included workflow `.github/workflows/deploy-pages.yml` will publish the site from the repository root whenever `main` is updated.

### 3) Open the live site

After the workflow succeeds, your site will be available at:

- `https://<your-username>.github.io/<repo-name>/` (project pages), or
- your custom Pages domain if configured.

## Notes

- Scores are stored in `localStorage`, so data persists per browser/device.
- For shared real-time scoring across multiple devices, you'd need a backend (that would be a reason to use another hosting/backend setup).

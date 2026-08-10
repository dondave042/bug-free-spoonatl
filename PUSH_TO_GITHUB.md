# Push this project to your GitHub

The repo is initialized and committed locally (branch `main`, 2 commits).
Run these in the project folder:

## Option A — new empty repo (recommended)

1. Create a new **empty** repository on GitHub (no README/license):  
   github.com → New repository → name it e.g. `atl-travels`
2. Then:

```bash
git remote add origin https://github.com/YOUR-USERNAME/atl-travels.git
git push -u origin main
```

(GitHub will ask you to log in — use a Personal Access Token as the password,
or run `gh auth login` first if you have the GitHub CLI.)

## Option B — from the download bundle

From the live site you can grab ready-made archives:

- **Full git history**: `/atl-travels.git.bundle`
  ```bash
  git clone atl-travels.git.bundle atl-travels
  cd atl-travels && git remote add origin https://github.com/YOUR-USERNAME/atl-travels.git
  git push -u origin main
  ```
- **Plain source zip**: `/atl-travels-source.zip` — unzip, `npm install`, `npm run dev`

## Deploy to Vercel from GitHub afterwards

Vercel → Add New Project → Import your repo → Framework: **Vite** →
`vercel.json` is already included (SPA rewrites), so routing works out of the box.
Add env vars from `backend/.env.example` if you wire up the Supabase backend.

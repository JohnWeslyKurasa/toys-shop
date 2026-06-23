Deploy checklist for Mother & Toddler

1) Build locally and preview

```bash
npm install
npm run build
# optional: serve locally to preview built output
npm run preview
```

2) Netlify settings
- Build command: `npm run build`
- Publish directory: `dist`
- (Optional) Add a redirect for SPA fallback by enabling the `_redirects` file or using `netlify.toml`.

3) Environment variables (Netlify / Vercel / other hosts)
Your app uses Vite env vars for Firebase. Add these in your host's Environment settings (replace values):

- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_FIREBASE_MEASUREMENT_ID

If these are not set, the app falls back to a local mock mode (auth and DB are mocked), but some features (real Firebase analytics, Firestore, auth) won't function.

4) Quick troubleshooting
- Open the browser console after deploy. If you see errors like `Failed to resolve module specifier "firebase/app"`, it means the site is serving unbuilt modules; ensure Netlify runs `npm run build` and publishes `dist`.
- If assets (images/CSS) 404: confirm `dist` contains `assets/` and publish directory is correct.

5) Optional quick workaround (not recommended long-term)
If you need the site to run immediately without a build step, I can convert `firebase-service.js` to use CDN module imports from the Firebase CDN (will change the file). Tell me if you'd like that.

6) Redeploy
After setting the environment variables and Netlify build settings, trigger a new deploy. Monitor the build log for `vite build` output and the browser console on the live site.

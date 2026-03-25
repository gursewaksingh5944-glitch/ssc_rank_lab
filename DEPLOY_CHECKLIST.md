# Production Deploy Checklist

## 1) Keep commit clean

Only commit app code/config required for production. Do not commit local DB/test artifacts.

Recommended staged files for current fix:

- `public/index.html`
- `public/script.js`
- `backend/server.js`
- `public/sitemap.xml`
- `backend/routes/payment.js`
- `backend/utils/planStore.js`

## 2) Untrack local-only files (keep them locally)

Run once if these files were already added to git:

```powershell
git rm --cached backend/database/database/app.db
git rm --cached backend/data/test-entries.json
```

## 3) Commit and push

```powershell
git add .
git commit -m "Fix premium CTA checkout flow + cache bust + no-cache headers"
git push
```

## 4) Trigger deploy (Render)

1. Open Render dashboard
2. Select the web service
3. Click `Manual Deploy` -> `Deploy latest commit`

## 5) Verify production is updated

Open:

- `https://sscranklab.com/?v=20260325d`

Then hard refresh (`Ctrl+Shift+R`).

Check page source has:

- `script.js?v=20260325d`
- `style.css?v=20260325d`
- `id="getAllFeaturesTopBtn"`
- `id="heroBuyBtn"`
- `id="pricingBuyBtn"`
- `id="instantBuyBtn"`

## 6) Functional smoke test (production)

Click these in order:

1. `Get All Features ₹99/mo` (opens trial/buy modal)
2. `Buy Premium Now ₹99` (direct Razorpay popup)
3. `Subscribe ₹99/month via Razorpay` (modal pay button)
4. `Buy Premium Instantly ₹99` (direct Razorpay popup)

If any fail: open browser devtools console and check for JS errors and blocked third-party scripts.

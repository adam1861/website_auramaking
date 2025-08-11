# Auramking — E‑commerce for Auramaking (3D Printing, Morocco)

**Stack**: Next.js 14 (App Router) • TypeScript • Tailwind • Prisma (Postgres) • PayPal (Sandbox)  
**Features**: Storefront (categories/products), cart, checkout, PayPal create/capture/webhook, admin list pages (CRUD stubs), inventory movements, seed data.  
**Defaults**: Currency **MAD**, Locale **fr-MA**, Country **MA**.

---

## 1) Local Setup

```bash
pnpm i
cp .env.example .env
# Fill DATABASE_URL (Neon/Railway), NEXTAUTH_SECRET, PAYPAL_* sandbox keys
pnpm db:push
pnpm db:seed
pnpm dev
```

Visit http://localhost:3000

- Admin seed user: `admin@auramking.com` / `ChangeMe123!` (change later).
- Categories: Anime Figures, Decorations, Board Games.
- Products: 12 sample items with placeholder images.

> Prices use **santimat** (MAD cents).

---

## 2) PayPal (Sandbox)

Create a PayPal developer app and set:
```
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_ENV=sandbox
```

Endpoints:
- `POST /api/payments/paypal/create-order` → returns PayPal `id`
- `POST /api/payments/paypal/capture` → marks Order as **PAID**
- `POST /api/payments/webhook/paypal` → stores events (extend with signature verification)

> If your PayPal account doesn’t support **MAD**, you can temporarily set `currency='USD'` at the moment of creating the order, while still pricing your store in MAD on the frontend.

---

## 3) Deploy (Vercel) + Namecheap DNS

- Push repo to GitHub, import to Vercel.
- Set env vars on Vercel: `DATABASE_URL`, `NEXTAUTH_SECRET`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV`, `DEFAULT_CURRENCY=MAD`, `DEFAULT_LOCALE=fr-MA`.
- **Namecheap**: In your domain dashboard → *Advanced DNS* → add a **CNAME** record for `www` to `cname.vercel-dns.com` and (optional) an **ALIAS/ANAME** or A records for root to Vercel’s addresses as guided by Vercel. Finish domain setup in Vercel.

---

## 4) What’s Included

- Storefront pages: Home, Category, Product, Cart, Checkout.
- Admin pages (MVP): Dashboard, Categories list, Products list (CRUD stubs ready for forms).
- Prisma models for Users, Categories, Products, Inventory Movements, Cart/Order entities.
- Currency formatting for **MAD** (Intl API, `fr-MA`).

---

## 5) Roadmap / Next Steps

- Wire **NextAuth** (email/password) and protect `/admin/**`.
- Add admin **create/edit forms** (React Hook Form + Zod) for Categories/Products/Inventory.
- Implement **stock reservation** during checkout + expiry.
- Add **order confirmation email** and invoices.
- Add **discounts/coupons** UI.
- Integrate PayPal **client JS buttons** on checkout page to approve & capture.
- S3/R2 **image uploads** for product images.

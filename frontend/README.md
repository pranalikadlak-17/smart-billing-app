# Smart Billing Application — Frontend

React + Vite frontend for the Smart Billing Application, built for the Finlec
Technologies Full Stack Developer Internship assessment.

## Tech stack

- React 19 + Vite
- React Router
- Tailwind CSS
- Axios

## Design

The UI is themed around the subject matter — a physical ledger book — rather than a
generic admin dashboard: ink-navy sidebar, paper-white workspace, invoice cards with a
torn/perforated top edge, and status badges styled like rubber ink stamps (PAID,
UNPAID, OVERDUE).

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the API URL

Copy the example env file:

```bash
cp .env.example .env
```

By default it points to the local backend:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

Update this if your backend runs elsewhere (e.g. after deploying to Render).

### 3. Run the dev server

```bash
npm run dev
```

The app runs at `http://localhost:5173`. Make sure the backend is running on port 8080
(or wherever you've pointed `VITE_API_BASE_URL`) — the app will show a friendly error
on the dashboard if it can't reach the API.

### 4. Build for production

```bash
npm run build
```

Output is written to `dist/`, ready to deploy to Vercel, Netlify, or similar.

## Pages

| Route              | Description                                      |
|---------------------|---------------------------------------------------|
| `/`                | Dashboard — revenue, pending amount, invoice counts |
| `/invoices`        | List of all invoices                              |
| `/invoices/new`    | Create an invoice (dynamic line items, live total preview) |
| `/invoices/:id`    | Invoice detail — line items, status update, AI summary |
| `/customers`       | Manage customers                                  |
| `/products`        | Manage the product/service catalog                |

## Project structure

```
src/
├── api/          # Axios client + API functions
├── components/    # Layout, StatusStamp
├── pages/        # Dashboard, Invoices, InvoiceCreate, InvoiceDetail, Customers, Products
└── utils/        # Currency/date formatting helpers
```

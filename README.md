# Smart Billing Application

Full stack billing/invoicing system built for the **Finlec Technologies Full Stack
Developer Internship Assessment**.

- `backend/` — Spring Boot + MySQL REST API
- `frontend/` — React + Vite + Tailwind client

See the README inside each folder for setup instructions. Quick start:

```bash
# Terminal 1 — backend
cd backend
mvn spring-boot:run

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173.

## What this covers

| Assessment criterion       | Where it lives                                              |
|------------------------------|----------------------------------------------------------------|
| CRUD Operations              | Customer, Product, Invoice controllers/services               |
| Database Design               | `entity/` package — Customer, Product, Invoice, InvoiceItem   |
| State Management              | React hooks (`useState`/`useEffect`) in each page              |
| Business Logic & Calculations | `InvoiceService.create()` — subtotal, tax, discount, total      |
| REST API Development          | `controller/` package, documented in backend README            |
| AI Integration                | `AiInsightService` — Gemini-generated invoice summaries         |
| Responsive UI                 | Tailwind, mobile-friendly grid layouts                          |
| Clean Folder Structure        | Layered backend (`entity/repository/service/controller/dto`); `api/components/pages` on the frontend |
| Error Handling                | `GlobalExceptionHandler`, friendly error states in the UI       |
| Git & GitHub                  | `.gitignore` in both folders, ready to push                    |
| Code Quality                  | Lombok to reduce boilerplate, consistent naming, DTOs for API contracts |
| Problem Solving                 | Invoice numbering, tax/discount math, graceful AI fallback        |
| Unit Testing (bonus)           | `InvoiceServiceTest` — Mockito-based calculation tests           |

## Notes for the reviewer

- Database schema is auto-created by Hibernate on first run (`ddl-auto=update`) — no
  manual migration scripts needed for local testing.
- The AI summary feature works out of the box with a templated fallback and upgrades
  automatically to real Gemini output if a `GEMINI_API_KEY` is provided.
- Discount and tax are both handled server-side to avoid trusting client-calculated
  totals — a common real-world billing bug.

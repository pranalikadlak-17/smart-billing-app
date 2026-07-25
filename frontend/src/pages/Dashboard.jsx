import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../api/billing";
import { formatCurrency } from "../utils/format";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((e) => setError(e.friendlyMessage || "Could not load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-ink-soft">Tallying the books…</p>;
  if (error)
    return (
      <div className="border border-stamp/40 bg-stamp/5 text-stamp px-4 py-3 rounded-md text-sm">
        {error}. Make sure the backend is running on port 8080.
      </div>
    );

  const stats = [
    { label: "Revenue collected", value: formatCurrency(data.totalRevenue), accent: "text-forest" },
    { label: "Pending amount", value: formatCurrency(data.totalPending), accent: "text-mustard" },
    { label: "Paid invoices", value: data.paidInvoiceCount, accent: "text-forest" },
    { label: "Unpaid invoices", value: data.unpaidInvoiceCount, accent: "text-mustard" },
    { label: "Overdue invoices", value: data.overdueInvoiceCount, accent: "text-stamp" },
    { label: "Customers on file", value: data.totalCustomers, accent: "text-ink" },
  ];

  return (
    <div>
      <header className="mb-8 flex items-end justify-between">
        <div>
          <p className="font-mono text-xs tracking-widest text-ink-soft uppercase">Ledger Overview</p>
          <h2 className="text-3xl font-semibold mt-1">Today's tally</h2>
        </div>
        <Link
          to="/invoices/new"
          className="bg-ink text-paper px-5 py-2.5 rounded-md text-sm font-medium hover:bg-ink-soft transition-colors"
        >
          + New Invoice
        </Link>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-ledger rounded-lg px-5 py-5"
          >
            <p className="text-xs uppercase tracking-wide text-ink-soft font-mono">{s.label}</p>
            <p className={`font-display text-2xl font-semibold mt-2 tabular-nums ${s.accent}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex gap-4 text-sm">
        <Link to="/invoices" className="text-ink-soft underline hover:text-ink">
          View all invoices →
        </Link>
        <Link to="/customers" className="text-ink-soft underline hover:text-ink">
          Manage customers →
        </Link>
        <Link to="/products" className="text-ink-soft underline hover:text-ink">
          Manage catalog →
        </Link>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getInvoices } from "../api/billing";
import { formatCurrency, formatDate } from "../utils/format";
import StatusStamp from "../components/StatusStamp";

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInvoices()
      .then(setInvoices)
      .catch((e) => setError(e.friendlyMessage))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <header className="mb-8 flex items-end justify-between">
        <div>
          <p className="font-mono text-xs tracking-widest text-ink-soft uppercase">Records</p>
          <h2 className="text-3xl font-semibold mt-1">Invoices</h2>
        </div>
        <Link
          to="/invoices/new"
          className="bg-ink text-paper px-5 py-2.5 rounded-md text-sm font-medium hover:bg-ink-soft transition-colors"
        >
          + New Invoice
        </Link>
      </header>

      {error && <p className="text-stamp text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-ink-soft">Loading invoices…</p>
      ) : invoices.length === 0 ? (
        <p className="text-ink-soft text-sm">No invoices yet. Create your first one.</p>
      ) : (
        <div className="grid gap-3">
          {invoices.map((inv) => (
            <Link
              to={`/invoices/${inv.id}`}
              key={inv.id}
              className="torn-edge bg-white border border-ledger border-t-0 rounded-b-lg px-6 py-4 flex items-center justify-between hover:shadow-sm transition-shadow"
            >
              <div>
                <p className="font-mono text-xs text-ink-soft">{inv.invoiceNumber}</p>
                <p className="font-medium mt-0.5">{inv.customer?.name}</p>
                <p className="text-xs text-ink-soft mt-0.5">
                  Issued {formatDate(inv.invoiceDate)} · Due {formatDate(inv.dueDate)}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <p className="font-display font-semibold tabular-nums text-lg">
                  {formatCurrency(inv.totalAmount)}
                </p>
                <StatusStamp status={inv.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

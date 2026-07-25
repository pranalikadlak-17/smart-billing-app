import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getInvoice, updateInvoiceStatus, getAiSummary } from "../api/billing";
import { formatCurrency, formatDate } from "../utils/format";
import StatusStamp from "../components/StatusStamp";

const STATUS_OPTIONS = ["UNPAID", "PAID", "OVERDUE", "CANCELLED"];

export default function InvoiceDetail() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  const load = () => {
    setLoading(true);
    getInvoice(id)
      .then(setInvoice)
      .catch((e) => setError(e.friendlyMessage))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleStatusChange = async (status) => {
    setUpdating(true);
    try {
      const updated = await updateInvoiceStatus(id, status);
      setInvoice(updated);
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleAiSummary = async () => {
    setSummaryLoading(true);
    setSummary("");
    try {
      const res = await getAiSummary(id);
      setSummary(res.summary);
    } catch (err) {
      setError(err.friendlyMessage);
    } finally {
      setSummaryLoading(false);
    }
  };

  if (loading) return <p className="text-ink-soft">Pulling up the record…</p>;
  if (error && !invoice)
    return <p className="text-stamp text-sm">{error}</p>;

  return (
    <div>
      <Link to="/invoices" className="text-xs text-ink-soft underline hover:text-ink">
        ← Back to invoices
      </Link>

      <div className="torn-edge bg-white border border-ledger border-t-0 rounded-b-lg p-8 mt-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs text-ink-soft">{invoice.invoiceNumber}</p>
            <h2 className="text-2xl font-semibold mt-1">{invoice.customer?.name}</h2>
            <p className="text-sm text-ink-soft mt-1">
              Issued {formatDate(invoice.invoiceDate)} · Due {formatDate(invoice.dueDate)}
            </p>
          </div>
          <StatusStamp status={invoice.status} />
        </div>

        <table className="w-full text-sm mt-8">
          <thead className="text-left text-xs uppercase font-mono text-ink-soft border-b border-ledger">
            <tr>
              <th className="py-2">Item</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Unit price</th>
              <th className="py-2 text-right">Tax %</th>
              <th className="py-2 text-right">Line total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item) => (
              <tr key={item.id} className="border-b border-ledger last:border-0">
                <td className="py-2.5">{item.product?.name}</td>
                <td className="py-2.5 text-right tabular-nums">{item.quantity}</td>
                <td className="py-2.5 text-right tabular-nums">{formatCurrency(item.unitPrice)}</td>
                <td className="py-2.5 text-right tabular-nums">{item.taxPercent}%</td>
                <td className="py-2.5 text-right tabular-nums">{formatCurrency(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-6">
          <div className="w-64 space-y-1.5 text-sm">
            <div className="flex justify-between text-ink-soft">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink-soft">
              <span>Tax</span>
              <span className="tabular-nums">{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-ink-soft">
              <span>Discount ({invoice.discountPercent}%)</span>
              <span className="tabular-nums">-{formatCurrency(invoice.discountAmount)}</span>
            </div>
            <div className="h-px bg-ledger my-2" />
            <div className="flex justify-between font-display text-lg font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(invoice.totalAmount)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <p className="mt-6 text-sm text-ink-soft border-t border-ledger pt-4">
            <span className="font-mono text-xs uppercase text-ink-soft/70 block mb-1">Notes</span>
            {invoice.notes}
          </p>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-ledger rounded-lg p-5">
          <p className="text-xs font-mono uppercase text-ink-soft mb-3">Update status</p>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                disabled={updating || s === invoice.status}
                onClick={() => handleStatusChange(s)}
                className="px-3 py-1.5 rounded-md text-xs font-medium border border-ledger hover:bg-paper disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-ledger rounded-lg p-5">
          <p className="text-xs font-mono uppercase text-ink-soft mb-3">AI summary</p>
          {summary ? (
            <p className="text-sm text-ink-soft italic">{summary}</p>
          ) : (
            <button
              onClick={handleAiSummary}
              disabled={summaryLoading}
              className="text-sm text-ink underline hover:text-ink-soft disabled:opacity-50"
            >
              {summaryLoading ? "Generating…" : "Generate a customer-facing note"}
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-stamp text-sm mt-4">{error}</p>}
    </div>
  );
}

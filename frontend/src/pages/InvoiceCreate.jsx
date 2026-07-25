import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCustomers, getProducts, createInvoice } from "../api/billing";
import { formatCurrency } from "../utils/format";

export default function InvoiceCreate() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [discountPercent, setDiscountPercent] = useState("0");
  const [items, setItems] = useState([{ productId: "", quantity: 1 }]);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCustomers().then(setCustomers).catch(() => {});
    getProducts().then(setProducts).catch(() => {});
  }, []);

  const productMap = useMemo(() => {
    const map = {};
    products.forEach((p) => (map[p.id] = p));
    return map;
  }, [products]);

  const calc = useMemo(() => {
    let subtotal = 0;
    let tax = 0;
    items.forEach((item) => {
      const product = productMap[item.productId];
      if (!product || !item.quantity) return;
      const lineBase = Number(product.price) * Number(item.quantity);
      const lineTax = (lineBase * Number(product.taxPercent || 0)) / 100;
      subtotal += lineBase;
      tax += lineTax;
    });
    const discount = (subtotal * Number(discountPercent || 0)) / 100;
    const total = subtotal + tax - discount;
    return { subtotal, tax, discount, total };
  }, [items, productMap, discountPercent]);

  const updateItem = (index, field, value) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setItems(next);
  };

  const addItem = () => setItems([...items, { productId: "", quantity: 1 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }
    const validItems = items.filter((i) => i.productId && Number(i.quantity) > 0);
    if (validItems.length === 0) {
      setError("Add at least one valid line item.");
      return;
    }

    setSaving(true);
    try {
      const invoice = await createInvoice({
        customerId: Number(customerId),
        items: validItems.map((i) => ({
          productId: Number(i.productId),
          quantity: Number(i.quantity),
        })),
        discountPercent: Number(discountPercent || 0),
        dueDate: dueDate || null,
        notes,
      });
      navigate(`/invoices/${invoice.id}`);
    } catch (err) {
      setFieldErrors(err.response?.data?.fieldErrors || {});
      setError(err.friendlyMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <header className="mb-8">
        <p className="font-mono text-xs tracking-widest text-ink-soft uppercase">New Record</p>
        <h2 className="text-3xl font-semibold mt-1">Create invoice</h2>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-ledger rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono uppercase text-ink-soft">Customer</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="mt-1 w-full border border-ledger rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/30 bg-white"
              >
                <option value="">Select customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-mono uppercase text-ink-soft">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full border border-ledger rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/30"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase text-ink-soft">Line items</label>
              <button
                type="button"
                onClick={addItem}
                className="text-xs font-medium text-ink-soft hover:text-ink underline"
              >
                + Add item
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => {
                const product = productMap[item.productId];
                return (
                  <div key={idx} className="flex gap-2 items-center">
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(idx, "productId", e.target.value)}
                      className="flex-1 border border-ledger rounded-md px-3 py-2 text-sm bg-white"
                    >
                      <option value="">Select item…</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {formatCurrency(p.price)}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                      className="w-20 border border-ledger rounded-md px-3 py-2 text-sm tabular-nums"
                    />
                    <span className="w-28 text-right text-sm tabular-nums text-ink-soft">
                      {product ? formatCurrency(product.price * (item.quantity || 0)) : "—"}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-stamp text-xs px-2"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono uppercase text-ink-soft">Discount %</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="mt-1 w-full border border-ledger rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/30"
              />
            </div>
            <div>
              <label className="text-xs font-mono uppercase text-ink-soft">Notes</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full border border-ledger rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/30"
              />
            </div>
          </div>

          {error && <p className="text-stamp text-sm">{error}</p>}
          {Object.values(fieldErrors).length > 0 && (
            <ul className="text-stamp text-xs list-disc list-inside">
              {Object.entries(fieldErrors).map(([k, v]) => (
                <li key={k}>{v}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-ink text-paper rounded-lg p-6 h-fit sticky top-6">
          <p className="font-mono text-xs uppercase tracking-widest text-white/50 mb-4">
            Live Total
          </p>
          <div className="space-y-2 text-sm">
            <Row label="Subtotal" value={calc.subtotal} />
            <Row label="Tax" value={calc.tax} />
            <Row label="Discount" value={-calc.discount} />
            <div className="h-px bg-white/15 my-3" />
            <Row label="Total" value={calc.total} big />
          </div>
          <button
            disabled={saving}
            className="mt-6 w-full bg-paper text-ink py-2.5 rounded-md text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Create invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Row({ label, value, big }) {
  return (
    <div className={`flex justify-between ${big ? "font-display text-lg font-semibold" : ""}`}>
      <span className={big ? "" : "text-white/60"}>{label}</span>
      <span className="tabular-nums">{formatCurrency(value)}</span>
    </div>
  );
}

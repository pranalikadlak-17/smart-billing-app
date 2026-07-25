import { useEffect, useState } from "react";
import { getProducts, createProduct, deleteProduct } from "../api/billing";
import { formatCurrency } from "../utils/format";

const EMPTY_FORM = { name: "", description: "", price: "", taxPercent: "0", stockQuantity: "0" };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getProducts()
      .then(setProducts)
      .catch((e) => setError(e.friendlyMessage))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});
    try {
      await createProduct({
        ...form,
        price: parseFloat(form.price || 0),
        taxPercent: parseFloat(form.taxPercent || 0),
        stockQuantity: parseInt(form.stockQuantity || 0, 10),
      });
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setFieldErrors(err.response?.data?.fieldErrors || {});
      setError(err.friendlyMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this item from the catalog?")) return;
    try {
      await deleteProduct(id);
      load();
    } catch (err) {
      setError(err.friendlyMessage);
    }
  };

  return (
    <div>
      <header className="mb-8">
        <p className="font-mono text-xs tracking-widest text-ink-soft uppercase">Inventory</p>
        <h2 className="text-3xl font-semibold mt-1">Catalog</h2>
      </header>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-ledger rounded-lg p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div className="lg:col-span-2">
          <label className="text-xs font-mono uppercase text-ink-soft">Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full border border-ledger rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/30"
          />
          {fieldErrors.name && <p className="text-stamp text-xs mt-1">{fieldErrors.name}</p>}
        </div>
        <div>
          <label className="text-xs font-mono uppercase text-ink-soft">Price (₹)</label>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="mt-1 w-full border border-ledger rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/30"
          />
        </div>
        <div className="lg:col-span-2">
          <label className="text-xs font-mono uppercase text-ink-soft">Description</label>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 w-full border border-ledger rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/30"
          />
        </div>
        <div>
          <label className="text-xs font-mono uppercase text-ink-soft">Tax %</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.taxPercent}
            onChange={(e) => setForm({ ...form, taxPercent: e.target.value })}
            className="mt-1 w-full border border-ledger rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/30"
          />
        </div>
        <div>
          <label className="text-xs font-mono uppercase text-ink-soft">Stock qty</label>
          <input
            type="number"
            min="0"
            value={form.stockQuantity}
            onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
            className="mt-1 w-full border border-ledger rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/30"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-between">
          {error && <p className="text-stamp text-sm">{error}</p>}
          <button
            disabled={saving}
            className="ml-auto bg-ink text-paper px-5 py-2 rounded-md text-sm font-medium hover:bg-ink-soft transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Add item"}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-ink-soft">Loading catalog…</p>
      ) : products.length === 0 ? (
        <p className="text-ink-soft text-sm">No items yet. Add your first one above.</p>
      ) : (
        <div className="bg-white border border-ledger rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-paper border-b border-ledger text-left text-xs uppercase font-mono text-ink-soft">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Tax %</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-ledger last:border-0">
                  <td className="px-5 py-3 font-medium">
                    {p.name}
                    {p.description && (
                      <p className="text-xs text-ink-soft font-normal">{p.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 tabular-nums">{formatCurrency(p.price)}</td>
                  <td className="px-5 py-3 tabular-nums">{p.taxPercent}%</td>
                  <td className="px-5 py-3 tabular-nums">{p.stockQuantity}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-stamp text-xs font-medium hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

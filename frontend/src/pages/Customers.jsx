import { useEffect, useState } from "react";
import { getCustomers, createCustomer, deleteCustomer } from "../api/billing";

const EMPTY_FORM = { name: "", email: "", phone: "", address: "" };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getCustomers()
      .then(setCustomers)
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
      await createCustomer(form);
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
    if (!confirm("Remove this customer? This cannot be undone.")) return;
    try {
      await deleteCustomer(id);
      load();
    } catch (err) {
      setError(err.friendlyMessage);
    }
  };

  return (
    <div>
      <header className="mb-8">
        <p className="font-mono text-xs tracking-widest text-ink-soft uppercase">Directory</p>
        <h2 className="text-3xl font-semibold mt-1">Customers</h2>
      </header>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-ledger rounded-lg p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <div>
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
          <label className="text-xs font-mono uppercase text-ink-soft">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full border border-ledger rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/30"
          />
          {fieldErrors.email && <p className="text-stamp text-xs mt-1">{fieldErrors.email}</p>}
        </div>
        <div>
          <label className="text-xs font-mono uppercase text-ink-soft">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-1 w-full border border-ledger rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/30"
          />
        </div>
        <div>
          <label className="text-xs font-mono uppercase text-ink-soft">Address</label>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="mt-1 w-full border border-ledger rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink/30"
          />
        </div>
        <div className="sm:col-span-2 flex items-center justify-between">
          {error && <p className="text-stamp text-sm">{error}</p>}
          <button
            disabled={saving}
            className="ml-auto bg-ink text-paper px-5 py-2 rounded-md text-sm font-medium hover:bg-ink-soft transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Add customer"}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-ink-soft">Loading customers…</p>
      ) : customers.length === 0 ? (
        <p className="text-ink-soft text-sm">No customers yet. Add your first one above.</p>
      ) : (
        <div className="bg-white border border-ledger rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-paper border-b border-ledger text-left text-xs uppercase font-mono text-ink-soft">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Address</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-ledger last:border-0">
                  <td className="px-5 py-3 font-medium">{c.name}</td>
                  <td className="px-5 py-3 text-ink-soft">{c.email || "—"}</td>
                  <td className="px-5 py-3 text-ink-soft">{c.phone || "—"}</td>
                  <td className="px-5 py-3 text-ink-soft">{c.address || "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
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

import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Ledger Overview", end: true },
  { to: "/invoices", label: "Invoices" },
  { to: "/customers", label: "Customers" },
  { to: "/products", label: "Catalog" },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 bg-ink text-paper flex flex-col">
        <div className="px-6 py-7 border-b border-white/10">
          <p className="font-mono text-xs tracking-[0.25em] text-mustard uppercase">Finlec</p>
          <h1 className="font-display text-2xl font-semibold mt-1">The Ledger</h1>
          <p className="text-xs text-white/50 mt-1">Smart Billing Application</p>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-paper text-ink"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-5 border-t border-white/10 text-[11px] text-white/40 font-mono">
          v1.0 — 2026 Assessment Build
        </div>
      </aside>
      <main className="flex-1 bg-paper">
        <div className="max-w-6xl mx-auto px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

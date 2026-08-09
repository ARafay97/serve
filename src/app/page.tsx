import Link from "next/link";

const stations = [
  { href: "/employee", label: "Employee Screen", desc: "Take orders and send them to the record." },
  { href: "/kitchen", label: "Kitchen Screen", desc: "Food prep display." },
  { href: "/bar", label: "Bar Screen", desc: "Mocktails, desserts, drinks and shakes." },
  { href: "/orders", label: "Active Orders", desc: "Everything currently in progress." },
  { href: "/completed", label: "Completed Orders", desc: "Full history of finished orders." },
  { href: "/orders/bar", label: "Completed Bar Orders", desc: "Bar-only completed history." },
  { href: "/orders/kitchen", label: "Completed Kitchen Orders", desc: "Kitchen-only completed history." },
];

export default function Home() {
  return (
    <div>
      <h1 className="page-title">MyBagh POS</h1>
      <p className="page-subtitle">Pick a station to get started.</p>

      <div
        className="ticket-grid"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
      >
        {stations.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="card"
            style={{ padding: 20, textDecoration: "none", display: "block" }}
          >
            <h3 style={{ color: "var(--gold)", fontSize: 15 }}>{s.label}</h3>
            <p style={{ color: "var(--muted2)", fontSize: 13, margin: 0 }}>{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

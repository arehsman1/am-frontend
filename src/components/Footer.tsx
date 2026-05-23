import { Link } from "react-router-dom";
import { Logo } from "./Logo";

const columns = [
  {
    title: "How we operate",
    items: [
      { label: "About", to: "/about" },
      { label: "Safety", to: "/guidelines" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", to: "/about" },
      { label: "Careers", to: "/careers" },
      { label: "Press", to: "/press" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
      { label: "Cookies", to: "/cookies" },
      { label: "Guidelines", to: "/guidelines" },
    ],
  },
];

export const Footer = () => (
  <footer className="border-t border-border bg-secondary/40">
    <div className="container grid gap-8 py-12 md:grid-cols-4">
      <div className="space-y-3">
        <Logo />
        <p className="text-sm text-muted-foreground">Real connections. No fake profiles. No noise.</p>
      </div>
      {columns.map((c) => (
        <div key={c.title}>
          <h4 className="mb-3 text-sm font-semibold">{c.title}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {c.items.map((i) => (
              <li key={i.label}>
                <Link to={i.to} className="hover:text-foreground transition-smooth">{i.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="border-t border-border">
      <div className="container py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Amorematch. Built for meaningful connections.
      </div>
    </div>
  </footer>
);

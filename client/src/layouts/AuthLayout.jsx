import { Link } from "react-router-dom";

export default function AuthLayout({ children, title, subtitle, ctaLabel, ctaTo }) {
  return (
    <main className="auth-page">
      <div className="auth-art">
        <Link to="/login" className="brand-mark">
          ms<span>/</span>
        </Link>
        <p className="eyebrow">MERNSECRETS / CONTROL PLANE</p>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
        <div className="signal">
          <span className="signal-dot" /> Systems ready <b>●</b> encrypted at rest
        </div>
      </div>
      <section className="auth-card">
        {children}
        {ctaLabel && ctaTo && (
          <p className="switch-auth">
            <Link to={ctaTo}>{ctaLabel}</Link>
          </p>
        )}
      </section>
    </main>
  );
}

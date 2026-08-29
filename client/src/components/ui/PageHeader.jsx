export default function PageHeader({ eyebrow, title, description, actions, children }) {
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="muted">{description}</p>
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

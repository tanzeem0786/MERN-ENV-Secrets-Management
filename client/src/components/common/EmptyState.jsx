export default function EmptyState({ title, text }) {
  return (
    <div className="empty">
      <span className="empty-mark">/</span>
      <b>{title}</b>
      <p>{text}</p>
    </div>
  );
}

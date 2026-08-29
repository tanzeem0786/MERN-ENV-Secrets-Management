export default function Metric({ label, value, hint, accent }) {
  return (
    <div className={`metric metric-${accent}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  );
}

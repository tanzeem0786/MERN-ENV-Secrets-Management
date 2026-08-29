export default function PanelTitle({ title, action }) {
  return (
    <div className="panel-title">
      <h3>{title}</h3>
      {action}
    </div>
  );
}

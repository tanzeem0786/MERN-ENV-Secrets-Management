export default function Notice({ children, tone = "error" }) {
  return children ? <div className={`notice notice-${tone}`}>{children}</div> : null;
}

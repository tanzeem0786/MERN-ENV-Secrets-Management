import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authApi } from "../api/auth.api";
import { fetchOrganizations, setActiveOrganization } from "../store/slices/organizationSlice";
import { signedOut } from "../store/slices/authSlice";
import Icon from "../components/ui/Icon";

export default function DashboardLayout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const orgs = useSelector((state) => state.organizations);
  const active = orgs.items.find((item) => item._id === orgs.activeId);

  useEffect(() => {
    if (orgs.status === "idle") dispatch(fetchOrganizations());
  }, [dispatch, orgs.status]);

  const logout = async () => {
    await authApi.logout().catch(() => {});
    dispatch(signedOut());
    navigate("/login");
  };

  const nav = [
    { to: "/dashboard", label: "Overview", icon: "⌂" },
    { to: "/projects", label: "Projects", icon: "▦" },
    { to: "/members", label: "Members", icon: "◌" },
    { to: "/audit-logs", label: "Audit trail", icon: "≋" },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/dashboard" className="brand-mark">
          ms<span>/</span>
        </Link>
        <div className="side-label">Workspace</div>
        <nav>
          {nav.map((item) => (
            <Link
              key={item.to}
              className={
                location.pathname.startsWith(item.to)
                  ? "nav-link active"
                  : "nav-link"
              }
              to={item.to}
            >
              <Icon>{item.icon}</Icon>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="security-badge">
            <span className="signal-dot" /> Vault online
          </div>
          <button className="user-chip" onClick={logout}>
            <span className="avatar">
              {user?.name?.slice(0, 1).toUpperCase()}
            </span>
            <span>
              <b>{user?.name}</b>
              <small>{user?.email}</small>
            </span>
            <span className="logout">↗</span>
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="breadcrumb">MERNSECRETS / </span>
            <b>{active?.name || "No workspace"}</b>
          </div>
          <select
            aria-label="Active organization"
            value={orgs.activeId || ""}
            onChange={(e) => {
              dispatch(setActiveOrganization(e.target.value));
              navigate("/dashboard");
            }}
          >
            <option value="" disabled>
              Select workspace
            </option>
            {orgs.items.map((org) => (
              <option key={org._id} value={org._id}>
                {org.name}
              </option>
            ))}
          </select>
        </header>
        {children}
      </main>
    </div>
  );
}

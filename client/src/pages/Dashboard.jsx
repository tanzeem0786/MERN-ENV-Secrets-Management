import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { projectApi } from "../api/project.api";
import { auditApi } from "../api/audit.api";
import { getErrorMessage } from "../utils/errors";
import PageHeader from "../components/ui/PageHeader";
import Notice from "../components/ui/Notice";
import Metric from "../components/common/Metric";
import PanelTitle from "../components/common/PanelTitle";
import EmptyState from "../components/common/EmptyState";
import Icon from "../components/ui/Icon";

export default function Dashboard() {
  const org = useSelector((state) =>
    state.organizations.items.find(
      (item) => item._id === state.organizations.activeId,
    ),
  );

  const [projects, setProjects] = useState([]);
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!org?._id) return;

    Promise.all([projectApi.list(org._id), auditApi.list()])
      .then(([p, a]) => {
        setProjects(p.data.data.projects);
        setActivity(a.data.data.logs.slice(0, 5));
      })
      .catch((e) => setError(getErrorMessage(e)));
  }, [org?._id]);

  return (
    <PageHeader
      eyebrow="Workspace overview"
      title={org?.name || "Choose a workspace"}
      description="A live read on your delivery surface."
      actions={
        <Link className="button button-primary" to="/projects">
          Open projects <Icon>→</Icon>
        </Link>
      }
    >
      <Notice>{error}</Notice>
      <div className="metrics">
        <Metric
          label="Projects"
          value={projects.length}
          hint="in this workspace"
          accent="coral"
        />
        <Metric
          label="Encrypted surface"
          value="AES-256"
          hint="protected at rest"
          accent="blue"
        />
        <Metric
          label="Access posture"
          value="RBAC"
          hint="server enforced"
          accent="lime"
        />
      </div>
      <div className="split-grid">
        <section className="panel">
          <PanelTitle
            title="Recent activity"
            action={<Link to="/audit-logs">View all →</Link>}
          />
          {activity.length ? (
            <div className="activity-list">
              {activity.map((item) => (
                <div className="activity-row" key={item._id}>
                  <span className="activity-icon">
                    {item.status === "denied" ? "!" : "↗"}
                  </span>
                  <div>
                    <b>{item.action?.replaceAll("_", " ")}</b>
                    <span>
                      {item.resourceName || item.resourceType || "system event"}
                    </span>
                  </div>
                  <time>{new Date(item.createdAt).toLocaleDateString()}</time>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No activity yet"
              text="Your workspace events will appear here."
            />
          )}
        </section>
        <section className="panel accent-panel">
          <p className="eyebrow">Operating principle</p>
          <h3>Visibility without exposure.</h3>
          <p className="muted">
            Secret lists return metadata only. Plaintext exists briefly, only
            after an explicit reveal action.
          </p>
          <Link className="text-link" to="/projects">
            Inspect your surface <Icon>→</Icon>
          </Link>
        </section>
      </div>
    </PageHeader>
  );
}

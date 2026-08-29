import { useEffect, useState } from "react";
import { auditApi } from "../api/audit.api";
import { getErrorMessage } from "../utils/errors";
import PageHeader from "../components/ui/PageHeader";
import Notice from "../components/ui/Notice";
import EmptyState from "../components/common/EmptyState";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    auditApi
      .list({ limit: 50 })
      .then((r) => setLogs(r.data.data.logs))
      .catch((e) => setError(getErrorMessage(e)));
  }, []);

  return (
    <PageHeader
      eyebrow="Traceability"
      title="Audit trail"
      description="A tenant-scoped record of sensitive operations and access decisions."
    >
      <Notice>{error}</Notice>
      <section className="panel table-panel">
        {logs.length ? (
          <div className="audit-table">
            <div className="table-head">
              <span>Action</span>
              <span>Resource</span>
              <span>Status</span>
              <span>Time</span>
            </div>
            {logs.map((log) => (
              <div className="table-row" key={log._id}>
                <b>{log.action?.replaceAll("_", " ")}</b>
                <span>{log.resourceName || log.resourceType || "—"}</span>
                <span
                  className={
                    log.status === "denied" ? "status denied" : "status"
                  }
                >
                  {log.status}
                </span>
                <time>{new Date(log.createdAt).toLocaleString()}</time>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No audit events"
            text="Operations will be recorded here."
          />
        )}
      </section>
    </PageHeader>
  );
}

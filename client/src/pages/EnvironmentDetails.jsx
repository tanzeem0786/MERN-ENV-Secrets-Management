import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { environmentApi } from "../api/environment.api";
import { secretApi } from "../api/secret.api";
import { can, getErrorMessage } from "../utils/errors";
import PageHeader from "../components/ui/PageHeader";
import Notice from "../components/ui/Notice";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import Icon from "../components/ui/Icon";
import PanelTitle from "../components/common/PanelTitle";
import EmptyState from "../components/common/EmptyState";

export default function EnvironmentDetails() {
  const { environmentId } = useParams();
  const role = useSelector((state) => state.auth.user?.role);
  const [environment, setEnvironment] = useState(null);
  const [secrets, setSecrets] = useState([]);
  const [form, setForm] = useState({ key: "", value: "", description: "" });
  const [revealed, setRevealed] = useState({});
  const [error, setError] = useState("");

  const load = () =>
    Promise.all([
      environmentApi.get(environmentId),
      secretApi.list(environmentId),
    ])
      .then(([e, s]) => {
        setEnvironment(e.data.data.environment);
        setSecrets(s.data.data.secrets);
      })
      .catch((err) => setError(getErrorMessage(err)));

  useEffect(() => {
    load();
    return () => setRevealed({});
  }, [environmentId]);

  const create = async (e) => {
    e.preventDefault();

    try {
      await secretApi.create({ ...form, environmentId });
      setForm({ key: "", value: "", description: "" });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const reveal = async (id) => {
    try {
      const response = await secretApi.reveal(id);
      setRevealed({ [id]: response.data.data.secret.value });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const hide = (id) =>
    setRevealed((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });

  const remove = async (id) => {
    if (!window.confirm("Delete this secret?")) return;

    try {
      await secretApi.remove(id);
      hide(id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (!environment) {
    return <PageHeader eyebrow="Environment" title="Loading environment..." />;
  }

  return (
    <PageHeader
      eyebrow="Project / environment"
      title={environment.name}
      description="Metadata stays visible. Values stay masked until you explicitly reveal them."
      actions={
        <Link className="button button-ghost" to="/projects">
          ← Projects
        </Link>
      }
    >
      <Notice>{error}</Notice>
      <div className="content-grid">
        <section className="panel">
          <PanelTitle title={`${secrets.length} secrets`} />
          <div className="secret-list">
            {secrets.length ? (
              secrets.map((secret) => (
                <div className="secret-row" key={secret._id}>
                  <div>
                    <b>{secret.key}</b>
                    <span>
                      {revealed[secret._id] ?? "••••••••••••••••"}
                      {revealed[secret._id] && (
                        <button className="hide-link" onClick={() => hide(secret._id)}>
                          hide
                        </button>
                      )}
                    </span>
                  </div>
                  <div className="secret-actions">
                    {can(role, "secret:reveal") && !revealed[secret._id] && (
                      <button
                        className="text-button"
                        onClick={() => reveal(secret._id)}
                      >
                        Reveal
                      </button>
                    )}
                    {can(role, "secret:delete") && (
                      <button
                        className="icon-button danger"
                        onClick={() => remove(secret._id)}
                        aria-label={`Delete ${secret.key}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No secrets here"
                text="Add the first environment variable."
              />
            )}
          </div>
        </section>
        {can(role, "secret:create") && (
          <section className="panel form-panel">
            <PanelTitle title="Add secret" />
            <form onSubmit={create}>
              <Field
                label="Key"
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
                required
              />
              <Field
                label="Value"
                type="password"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                required
              />
              <Field
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <Button>
                Create secret <Icon>↗</Icon>
              </Button>
            </form>
          </section>
        )}
      </div>
    </PageHeader>
  );
}

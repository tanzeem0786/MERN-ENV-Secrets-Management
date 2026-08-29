import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { projectApi } from "../api/project.api";
import { environmentApi } from "../api/environment.api";
import { can, getErrorMessage } from "../utils/errors";
import PageHeader from "../components/ui/PageHeader";
import Notice from "../components/ui/Notice";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import Icon from "../components/ui/Icon";
import PanelTitle from "../components/common/PanelTitle";
import EmptyState from "../components/common/EmptyState";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const role = useSelector((state) => state.auth.user?.role);
  const [project, setProject] = useState(null);
  const [envs, setEnvs] = useState([]);
  const [form, setForm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({ name: "" });
  const [error, setError] = useState("");

  const load = () =>
    Promise.all([projectApi.get(projectId), environmentApi.list(projectId)])
      .then(([p, e]) => {
        setProject(p.data.data.project);
        setEnvs(e.data.data.environments);
      })
      .catch((err) => setError(getErrorMessage(err)));

  useEffect(load, [projectId]);

  const createEnv = async (e) => {
    e.preventDefault();

    try {
      await environmentApi.create({ name: form, projectId });
      setForm("");
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const startEditEnv = (env) => {
    setEditingId(env._id);
    setEditingForm({ name: env.name });
  };

  const saveEnv = async (id) => {
    try {
      setError("");
      await environmentApi.update(id, { name: editingForm.name });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const removeEnv = async (id) => {
    if (!window.confirm("Delete this environment?")) return;

    try {
      await environmentApi.remove(id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (!project) {
    return <PageHeader eyebrow="Project" title="Loading project..." />;
  }

  return (
    <PageHeader
      eyebrow="Project / environments"
      title={project.name}
      description={
        project.description || "Manage the environments attached to this project."
      }
      actions={
        <Link className="button button-ghost" to="/projects">
          ← Projects
        </Link>
      }
    >
      <Notice>{error}</Notice>
      <div className="content-grid">
        <section className="panel">
          <PanelTitle title="Environments" />
          <div className="project-list">
            {envs.length ? (
              envs.map((env) => (
                <div className="project-row" key={env._id}>
                  <div className="env-symbol">⌁</div>
                  {editingId === env._id ? (
                    <div className="inline-edit-panel">
                      <div className="inline-form">
                        <Field
                          label="Environment name"
                          value={editingForm.name}
                          onChange={(e) =>
                            setEditingForm({ name: e.target.value })
                          }
                        />
                      </div>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => saveEnv(env._id)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <Link to={`/projects/${projectId}/environments/${env._id}`}>
                          <b>{env.name}</b>
                        </Link>
                        <span>
                          {env.description || "Ready for secrets"} · {env.slug}
                        </span>
                      </div>
                      <div className="row-actions">
                        {can(role, "environment:update") && (
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => startEditEnv(env)}
                          >
                            Edit
                          </button>
                        )}
                        {can(role, "environment:delete") && (
                          <button
                            className="icon-button danger"
                            onClick={() => removeEnv(env._id)}
                            aria-label={`Delete ${env.name}`}
                            type="button"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <EmptyState
                title="No environments"
                text="Add Development, Staging, or Production."
              />
            )}
          </div>
        </section>
        {can(role, "environment:create") && (
          <section className="panel form-panel">
            <PanelTitle title="New environment" />
            <form onSubmit={createEnv}>
              <Field
                label="Environment name"
                value={form}
                minLength="3"
                onChange={(e) => setForm(e.target.value)}
                required
              />
              <Button>
                Create environment <Icon>↗</Icon>
              </Button>
            </form>
          </section>
        )}
      </div>
    </PageHeader>
  );
}

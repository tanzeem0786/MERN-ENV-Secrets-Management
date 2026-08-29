import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { projectApi } from "../api/project.api";
import { can, getErrorMessage } from "../utils/errors";
import PageHeader from "../components/ui/PageHeader";
import Notice from "../components/ui/Notice";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import Icon from "../components/ui/Icon";
import PanelTitle from "../components/common/PanelTitle";
import EmptyState from "../components/common/EmptyState";

export default function Projects() {
  const org = useSelector((state) =>
    state.organizations.items.find(
      (item) => item._id === state.organizations.activeId,
    ),
  );
  const role = useSelector((state) => state.auth.user?.role);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const canCreate = can(role, "project:create");

  const load = () =>
    org?._id &&
    projectApi
      .list(org._id)
      .then((r) => setProjects(r.data.data.projects))
      .catch((e) => setError(getErrorMessage(e)));

  useEffect(load, [org?._id]);

  const create = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await projectApi.create({ ...form, organizationId: org._id });
      setForm({ name: "", description: "" });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (project) => {
    setEditingId(project._id);
    setEditingForm({ name: project.name, description: project.description || "" });
  };

  const saveProject = async (id) => {
    try {
      setError("");
      await projectApi.update(id, {
        name: editingForm.name,
        description: editingForm.description,
      });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this project?")) return;

    try {
      await projectApi.remove(id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <PageHeader
      eyebrow="Delivery surface"
      title="Projects"
      description="Organize the systems your team ships."
    >
      <Notice>{error}</Notice>
      <div className="content-grid">
        <section className="panel">
          <PanelTitle title={`${projects.length} projects`} />
          <div className="project-list">
            {projects.length ? (
              projects.map((project) => (
                <div className="project-row" key={project._id}>
                  <div className="project-symbol">
                    {project.name.slice(0, 1).toUpperCase()}
                  </div>
                  {editingId === project._id ? (
                    <div className="inline-edit-panel">
                      <div className="inline-form">
                        <Field
                          label="Project name"
                          value={editingForm.name}
                          onChange={(e) =>
                            setEditingForm({ ...editingForm, name: e.target.value })
                          }
                        />
                        <Field
                          label="Description"
                          value={editingForm.description}
                          onChange={(e) =>
                            setEditingForm({
                              ...editingForm,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => saveProject(project._id)}
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
                        <Link to={`/projects/${project._id}`}>
                          <b>{project.name}</b>
                        </Link>
                        <span>
                          {project.description || "No description"} · {project.slug}
                        </span>
                      </div>
                      <div className="row-actions">
                        {can(role, "project:update") && (
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => startEdit(project)}
                          >
                            Edit
                          </button>
                        )}
                        {can(role, "project:delete") && (
                          <button
                            type="button"
                            className="icon-button danger"
                            aria-label={`Delete ${project.name}`}
                            onClick={() => remove(project._id)}
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
                title="No projects yet"
                text="Create your first delivery surface."
              />
            )}
          </div>
        </section>
        {canCreate && (
          <section className="panel form-panel">
            <PanelTitle title="New project" />
            <form onSubmit={create}>
              <Field
                label="Project name"
                value={form.name}
                minLength="3"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Field
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <Button disabled={loading}>
                {loading ? "Creating..." : "Create project"} <Icon>↗</Icon>
              </Button>
            </form>
          </section>
        )}
      </div>
    </PageHeader>
  );
}

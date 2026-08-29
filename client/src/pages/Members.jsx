import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import Icon from "../components/ui/Icon";

export default function Members() {
  return (
    <PageHeader
      eyebrow="Access control"
      title="Members"
      description="Membership visibility is ready for the next backend contract."
    >
      <section className="panel empty-feature">
        <div className="feature-number">00</div>
        <h3>Member management is not exposed yet</h3>
        <p className="muted">
          The current API provides membership authorization internally, but no
          member-list or invitation endpoint. This page intentionally does not
          invent one.
        </p>
        <Link className="button button-ghost" to="/audit-logs">
          Review access events <Icon>→</Icon>
        </Link>
      </section>
    </PageHeader>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../store/slices/authSlice";
import AuthLayout from "../layouts/AuthLayout";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import Notice from "../components/ui/Notice";
import Icon from "../components/ui/Icon";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }

    const action = await dispatch(register(form));

    if (action.meta.requestStatus === "fulfilled") {
      navigate("/login");
    } else {
      setError(action.payload || "Unable to continue.");
    }
  };

  return (
    <AuthLayout
      title="Keep your runtime secrets close, and your uncertainty closer."
      subtitle="A quiet command center for teams shipping software across environments."
      ctaLabel="Already have an account? Sign in"
      ctaTo="/login"
    >
      <p className="eyebrow">New workspace</p>
      <h2>Create your account</h2>
      <p className="muted">Start with a secure workspace identity.</p>
      <Notice>{error || auth.error}</Notice>
      <form onSubmit={submit}>
        <Field
          label="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Field
          label="Email address"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <Button disabled={auth.status === "loading"}>
          {auth.status === "loading" ? "Working..." : "Create account"} <Icon>↗</Icon>
        </Button>
      </form>
    </AuthLayout>
  );
}

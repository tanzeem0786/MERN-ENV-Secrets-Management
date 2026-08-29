import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/slices/authSlice";
import AuthLayout from "../layouts/AuthLayout";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import Notice from "../components/ui/Notice";
import Icon from "../components/ui/Icon";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }

    const action = await dispatch(login({ email: form.email, password: form.password }));

    if (action.meta.requestStatus === "fulfilled") {
      navigate("/dashboard");
    } else {
      setError(action.payload || "Unable to continue.");
    }
  };

  return (
    <AuthLayout
      title="Keep your runtime secrets close, and your uncertainty closer."
      subtitle="A quiet command center for teams shipping software across environments."
      ctaLabel="Need an account? Register"
      ctaTo="/register"
    >
      <p className="eyebrow">Welcome back</p>
      <h2>Sign in to your vault</h2>
      <p className="muted">Your access cookie stays safely out of reach.</p>
      <Notice>{error || auth.error}</Notice>
      <form onSubmit={submit}>
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
          {auth.status === "loading" ? "Working..." : "Enter dashboard"} <Icon>↗</Icon>
        </Button>
      </form>
    </AuthLayout>
  );
}

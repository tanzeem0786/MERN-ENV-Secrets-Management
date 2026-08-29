import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children }) {
  const auth = useSelector((state) => state.auth);

  if (auth.status === "loading" || auth.status === "idle") {
    return <div className="screen-loading">Restoring secure session...</div>;
  }

  return auth.user ? children : <Navigate to="/login" replace />;
}

export const getErrorMessage = (error, fallback = "Something went wrong") => {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You do not have permission for that action.";
  if (status === 404) return "That resource could not be found.";
  if (status === 409) return message || "That item already exists.";
  if (status === 429) return "Too many requests. Please try again shortly.";
  return message || fallback;
};

export const can = (role, permission) => {
  const matrix = {
    owner: ["*"],
    admin: ["project:", "environment:", "secret:", "audit:"],
    developer: [
      "secret:read",
      "secret:create",
      "secret:update",
      "secret:reveal",
      "audit:read",
    ],
    viewer: [
      "organization:read",
      "project:read",
      "environment:read",
      "secret:read",
      "audit:read",
    ],
  };
  return (matrix[role] || []).some(
    (item) =>
      item === "*" ||
      item === permission ||
      (item.endsWith(":") && permission.startsWith(item)),
  );
};

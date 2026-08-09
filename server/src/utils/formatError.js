const formatError = (error) => {
  if (error?.issues) {
    return error.issues.map((issue) => issue.message).join('; ');
  }
  return error.message || 'Invalid request';
};

export default formatError;
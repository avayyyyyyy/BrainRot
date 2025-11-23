export const getInputError = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return "Script prompt is required";
  }
  if (trimmed.length < 10) {
    return "Script prompt must be at least 10 characters";
  }
  if (trimmed.length > 2000) {
    return "Script prompt must be less than 2000 characters";
  }

  return undefined;
};

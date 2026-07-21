export async function withLoading(setLoading, operation) {
  setLoading(true);

  try {
    return await operation();
  } finally {
    setLoading(false);
  }
}

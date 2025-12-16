// Stub auth hook - no authentication in client-only mode
export function useAuth() {
  return {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    refresh: () => Promise.resolve(),
    logout: () => Promise.resolve(),
  };
}

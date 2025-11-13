import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";

type LoadingCtx = {
  loading: boolean;
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
};

const Ctx = createContext<LoadingCtx | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  const showLoading = useCallback(() => setLoading(true), []);
  const hideLoading = useCallback(() => setLoading(false), []);
  const withLoading = useCallback(async <T,>(fn: () => Promise<T>) => {
    setLoading(true);
    try {
      return await fn();
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      loading,
      isLoading: loading,
      showLoading,
      hideLoading,
      withLoading,
    }),
    [loading, showLoading, hideLoading, withLoading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLoading() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLoading must be used within LoadingProvider");
  return ctx;
}

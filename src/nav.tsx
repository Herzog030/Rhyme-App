import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type Route =
  | { name: 'archive' }
  | { name: 'song'; id: number }
  | { name: 'new-song' }
  | { name: 'rhymes' }
  | { name: 'settings' };

interface NavCtx {
  route: Route;
  go: (r: Route) => void;
  back: () => void;
  canBack: boolean;
}

const Ctx = createContext<NavCtx | null>(null);

export function NavProvider({ children, initial }: { children: ReactNode; initial?: Route }) {
  const [stack, setStack] = useState<Route[]>([initial ?? { name: 'archive' }]);

  const value = useMemo<NavCtx>(
    () => ({
      route: stack[stack.length - 1]!,
      go: (r) => setStack((s) => [...s, r]),
      back: () =>
        setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
      canBack: stack.length > 1,
    }),
    [stack],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNav(): NavCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useNav must be used within NavProvider');
  return v;
}

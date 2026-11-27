export interface DemoSwitcherEnv {
  NODE_ENV?: string;
  NEXT_PUBLIC_DEMO_SWITCHER?: string;
  VERCEL_ENV?: string;
}

export function isDemoSwitcherEnabled(env: DemoSwitcherEnv = process.env): boolean {
  if (env.VERCEL_ENV === "production") return false;
  if (env.NODE_ENV === "production") {
    return env.NEXT_PUBLIC_DEMO_SWITCHER === "true";
  }
  return true;
}

export function isLocalBrowserHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

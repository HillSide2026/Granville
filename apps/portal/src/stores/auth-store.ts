import { create } from "zustand";
import type { PortalRole } from "@/components/layout/data/sidebar-data";
import { getCookie, removeCookie, setCookie } from "@/lib/cookies";

const ACCESS_TOKEN = "granville_access_token";
const AUTH_USER = "granville_auth_user";

export interface AuthUser {
  id: string;
  email: string;
  role: PortalRole;
  organizationName?: string;
}

interface AuthState {
  auth: {
    user: AuthUser | null;
    setUser: (user: AuthUser | null) => void;
    accessToken: string;
    role: PortalRole;
    setAccessToken: (accessToken: string, role?: PortalRole) => void;
    resetAccessToken: () => void;
    reset: () => void;
  };
}

function roleFromToken(token: string): PortalRole {
  if (token === "dev-admin" || token.startsWith("admin-")) return "admin";
  if (token.startsWith("ops-")) return "ops";
  if (token.startsWith("compliance-")) return "compliance";
  return "customer";
}

function parseCookieValue<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(decodeURIComponent(value)) as T;
  } catch {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
}

function persistCookieValue(name: string, value: unknown) {
  setCookie(name, encodeURIComponent(JSON.stringify(value)));
}

function fallbackUserFromToken(token: string): AuthUser | null {
  if (!token) return null;

  return {
    id: `token:${token}`,
    email: "operator@granville.local",
    role: roleFromToken(token),
    organizationName: "Granville",
  };
}

export const useAuthStore = create<AuthState>()((set) => {
  const initToken = parseCookieValue(getCookie(ACCESS_TOKEN), "");
  const initUser = parseCookieValue<AuthUser | null>(getCookie(AUTH_USER), null);
  // Auto-load dev token from env if available and no token stored
  const devToken = (import.meta as unknown as { env: Record<string, string> }).env
    ?.VITE_GRANVILLE_DEV_TOKEN;
  const token = initToken || devToken || "";
  const user = initUser ?? fallbackUserFromToken(token);
  return {
    auth: {
      user,
      role: user?.role ?? roleFromToken(token),
      setUser: (user) =>
        set((state) => {
          if (user) {
            persistCookieValue(AUTH_USER, user);
          } else {
            removeCookie(AUTH_USER);
          }

          return {
            ...state,
            auth: {
              ...state.auth,
              user,
              role: user?.role ?? state.auth.role,
            },
          };
        }),
      accessToken: token,
      setAccessToken: (accessToken, role) =>
        set((state) => {
          persistCookieValue(ACCESS_TOKEN, accessToken);
          return {
            ...state,
            auth: {
              ...state.auth,
              accessToken,
              role: role ?? roleFromToken(accessToken),
            },
          };
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN);
          return {
            ...state,
            auth: { ...state.auth, accessToken: "", role: "customer" },
          };
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN);
          removeCookie(AUTH_USER);
          return {
            ...state,
            auth: {
              ...state.auth,
              user: null,
              accessToken: "",
              role: "customer",
            },
          };
        }),
    },
  };
});

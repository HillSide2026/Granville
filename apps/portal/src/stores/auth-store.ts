import { create } from "zustand";
import type { PortalRole } from "@/components/layout/data/sidebar-data";
import { getCookie, removeCookie, setCookie } from "@/lib/cookies";

const ACCESS_TOKEN = "granville_access_token";

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

export const useAuthStore = create<AuthState>()((set) => {
  const cookieState = getCookie(ACCESS_TOKEN);
  const initToken = cookieState ? JSON.parse(cookieState) : "";
  // Auto-load dev token from env if available and no token stored
  const devToken = (import.meta as unknown as { env: Record<string, string> }).env
    ?.VITE_GRANVILLE_DEV_TOKEN;
  const token = initToken || devToken || "";
  return {
    auth: {
      user: null,
      role: roleFromToken(token),
      setUser: (user) => set((state) => ({ ...state, auth: { ...state.auth, user } })),
      accessToken: token,
      setAccessToken: (accessToken, role) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken));
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

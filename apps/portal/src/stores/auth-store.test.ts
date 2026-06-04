import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearCookies } from "@/test-utils/cookies";

async function importAuthStore() {
  const { useAuthStore } = await import("./auth-store");
  return useAuthStore;
}

const sampleUser = {
  id: "user-1",
  email: "user@example.com",
  role: "customer" as const,
};

function configuredDevToken() {
  return (
    (import.meta as unknown as { env: Record<string, string> }).env
      ?.VITE_GRANVILLE_DEV_TOKEN ?? ""
  );
}

describe("useAuthStore", () => {
  beforeEach(() => {
    clearCookies();
    vi.resetModules();
  });

  it("starts with the configured dev token when nothing is persisted", async () => {
    const useAuthStore = await importAuthStore();
    const devToken = configuredDevToken();

    expect(useAuthStore.getState().auth.accessToken).toBe(devToken);
    if (devToken) {
      expect(useAuthStore.getState().auth.user).toEqual(
        expect.objectContaining({
          id: `token:${devToken}`,
          email: "operator@granville.local",
        })
      );
    } else {
      expect(useAuthStore.getState().auth.user).toBeNull();
    }
  });

  it("persists access token so a new store instance reads it back", async () => {
    const useAuthStore = await importAuthStore();
    useAuthStore.getState().auth.setAccessToken("session-token");

    vi.resetModules();
    const useAuthStoreAfterReload = await importAuthStore();

    expect(useAuthStoreAfterReload.getState().auth.accessToken).toBe("session-token");
  });

  it("clears persisted access token when resetAccessToken is used", async () => {
    const useAuthStore = await importAuthStore();
    useAuthStore.getState().auth.setAccessToken("to-clear");
    useAuthStore.getState().auth.resetAccessToken();

    vi.resetModules();
    const useAuthStoreAfterReload = await importAuthStore();

    expect(useAuthStoreAfterReload.getState().auth.accessToken).toBe("");
  });

  it("updates the signed-in user via setUser", async () => {
    const useAuthStore = await importAuthStore();

    useAuthStore.getState().auth.setUser({ ...sampleUser });

    expect(useAuthStore.getState().auth.user).toEqual(sampleUser);
  });

  it("persists the signed-in user so a new store instance reads it back", async () => {
    const useAuthStore = await importAuthStore();
    useAuthStore.getState().auth.setUser({ ...sampleUser });

    vi.resetModules();
    const useAuthStoreAfterReload = await importAuthStore();

    expect(useAuthStoreAfterReload.getState().auth.user).toEqual(sampleUser);
  });

  it("reset clears user and access token and drops persistence", async () => {
    const useAuthStore = await importAuthStore();
    useAuthStore.getState().auth.setAccessToken("will-be-cleared");
    useAuthStore.getState().auth.setUser({ ...sampleUser });

    useAuthStore.getState().auth.reset();

    expect(useAuthStore.getState().auth.user).toBeNull();
    expect(useAuthStore.getState().auth.accessToken).toBe("");

    vi.resetModules();
    const useAuthStoreAfterReload = await importAuthStore();

    expect(useAuthStoreAfterReload.getState().auth.user).toBeNull();
    expect(useAuthStoreAfterReload.getState().auth.accessToken).toBe("");
  });
});

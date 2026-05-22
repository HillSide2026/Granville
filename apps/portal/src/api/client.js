import { portalMockData } from "./mockData";

const clone = (value) => JSON.parse(JSON.stringify(value));
const delay = (value, latencyMs = 120) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(clone(value)), latencyMs);
  });

const mockState = clone(portalMockData);

const activitySummary = () => ({
  total: mockState.activity.length,
  pending: mockState.activity.filter((item) => item.status === "Pending approval").length,
  processing: mockState.activity.filter((item) => item.status === "Processing").length,
  completed: mockState.activity.filter((item) => item.status === "Completed").length,
});

export const portalClient = {
  async getSession() {
    return delay({
      organization: mockState.organization,
      profile: mockState.profile,
      notifications: mockState.notifications,
    });
  },

  async signIn() {
    return delay({ success: true, redirectTo: "/dashboard" });
  },

  async signUp() {
    return delay({ success: true, redirectTo: "/dashboard" });
  },

  async getDashboard() {
    return delay({
      organization: mockState.organization,
      profile: mockState.profile,
      metrics: mockState.metrics,
      balances: mockState.balances,
      onboardingChecklist: mockState.onboardingChecklist,
      notifications: mockState.notifications,
      accounts: mockState.accounts.slice(0, 3),
      activity: mockState.activity.slice(0, 4),
    });
  },

  async getAccounts() {
    return delay({
      organization: mockState.organization,
      balances: mockState.balances,
      accounts: mockState.accounts,
    });
  },

  async getActivity() {
    return delay({
      organization: mockState.organization,
      activity: mockState.activity,
      summary: activitySummary(),
    });
  },

  async getSettings() {
    return delay({
      organization: mockState.organization,
      profile: mockState.profile,
      settings: mockState.settings,
      contacts: mockState.contacts,
    });
  },

  async saveSettings(nextSettings) {
    mockState.settings = { ...mockState.settings, ...nextSettings };
    mockState.profile = {
      ...mockState.profile,
      name: mockState.settings.displayName,
      role: mockState.settings.title,
      email: mockState.settings.email,
      phone: mockState.settings.phone,
      timezone: mockState.settings.timezone,
    };

    return delay({
      savedAt: "Just now",
      settings: mockState.settings,
      profile: mockState.profile,
    });
  },
};

export default portalClient;

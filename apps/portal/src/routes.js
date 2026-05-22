export const Routes = {
  Root: { path: "/" },
  Dashboard: { path: "/dashboard" },
  Accounts: { path: "/accounts" },
  Activity: { path: "/activity" },
  Settings: { path: "/settings" },
  Signin: { path: "/sign-in" },
  Signup: { path: "/sign-up" },
  NotFound: { path: "/not-found" },
};

export const primaryNavigation = [
  { title: "Dashboard", path: Routes.Dashboard.path, icon: "dashboard" },
  { title: "Accounts", path: Routes.Accounts.path, icon: "accounts" },
  { title: "Activity", path: Routes.Activity.path, icon: "activity" },
  { title: "Settings", path: Routes.Settings.path, icon: "settings" },
];

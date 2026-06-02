import { createPortalIcon } from "@/components/ui/portal-icon";
// SettingsIcon removed — Settings is accessible via the ProfileDropdown (⌘S)
import type { Organisation, SidebarData } from "../types";

export type PortalRole = "customer" | "ops" | "compliance" | "admin";

const AnalyticsIcon = createPortalIcon("analytics");
const BankIcon = createPortalIcon("bank");
const BudgetIcon = createPortalIcon("budget");
const ChatIcon = createPortalIcon("chat");
const ConversionExchangeIcon = createPortalIcon("conversion-exchange");
const CreditCardIcon = createPortalIcon("credit-card");
const HomeIcon = createPortalIcon("home");
const PaymentFlowIcon = createPortalIcon("payment-flow");
const TasksIcon = createPortalIcon("tasks");
const WalletIcon = createPortalIcon("wallet");

export function roleLabel(role: PortalRole): string {
  switch (role) {
    case "admin":
      return "Administrator";
    case "ops":
      return "Treasury Manager";
    case "compliance":
      return "Compliance Officer";
    default:
      return "Account Member";
  }
}

function deriveWorkspace(role: PortalRole): string {
  switch (role) {
    case "admin":
      return "Administration";
    case "ops":
      return "Treasury Operations";
    case "compliance":
      return "Compliance";
    default:
      return "Treasury Workspace";
  }
}

function deriveOrgName(email?: string, organizationName?: string): string {
  if (organizationName) return organizationName;
  if (!email) return "My Organisation";
  const domain = email.split("@")[1] ?? "";
  const base = domain.replace(/\.(com|ca|io|net|org|co\.uk|gov|edu|com\.au)$/, "");
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export function deriveOrganisation(
  role: PortalRole = "customer",
  email?: string,
  organizationName?: string,
): Organisation {
  return {
    name: deriveOrgName(email, organizationName),
    workspaceName: deriveWorkspace(role),
  };
}

export function getSidebarData(
  role: PortalRole = "customer",
  email?: string,
  organizationName?: string,
): SidebarData {
  return {
    organisation: deriveOrganisation(role, email, organizationName),
    navGroups: [
      {
        title: "Dashboard",
        items: [
          { title: "Dashboard", url: "/", icon: HomeIcon },
          { title: "KPI 1", url: "/kpis/1", icon: AnalyticsIcon },
          { title: "KPI 2", url: "/kpis/2", icon: AnalyticsIcon },
          { title: "KPI 3", url: "/kpis/3", icon: AnalyticsIcon },
        ],
      },
      {
        title: "Today",
        items: [
          { title: "Tasks", url: "/tasks", icon: TasksIcon },
          { title: "Chat", url: "/chat", icon: ChatIcon },
        ],
      },
      {
        title: "Finance",
        items: [
          { title: "Budgets", url: "/budgets", icon: BudgetIcon },
          {
            title: "Wallets",
            url: "/wallets",
            badge: "Coming Soon",
            disabled: true,
            icon: WalletIcon,
          },
          { title: "Balances", url: "/balances", icon: BankIcon },
        ],
      },
      {
        title: "Transactions",
        items: [
          { title: "Payments", url: "/payments", icon: PaymentFlowIcon },
          { title: "Sales", url: "/sales", icon: CreditCardIcon },
        ],
      },
      {
        title: "Services",
        items: [{ title: "FX", url: "/fx", icon: ConversionExchangeIcon }],
      },
    ],
  };
}

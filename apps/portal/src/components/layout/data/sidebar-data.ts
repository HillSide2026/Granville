import { createPortalIcon } from "@/components/ui/portal-icon";
import type { Organisation, SidebarData } from "../types";

export type PortalRole = "customer" | "ops" | "compliance" | "admin";

const BankIcon = createPortalIcon("bank");
const BudgetIcon = createPortalIcon("budget");
const AccountingIcon = createPortalIcon("accounting");
const ApprovalIcon = createPortalIcon("approval");
const ChatIcon = createPortalIcon("chat");
const HomeIcon = createPortalIcon("home");
const MerchantPlatformIcon = createPortalIcon("merchant-platform");
const PaymentFlowIcon = createPortalIcon("payment-flow");
const PaymentProcessorIcon = createPortalIcon("processor");
const ReconciliationIcon = createPortalIcon("reconciliation");
const RequestsIcon = createPortalIcon("requests");
const TasksIcon = createPortalIcon("tasks");
const UsersIcon = createPortalIcon("users");

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
        title: "Workspace",
        items: [{ title: "Overview", url: "/", icon: HomeIcon }],
      },
      {
        title: "Financial Operations",
        items: [
          { title: "Budgets", url: "/budgets", icon: BudgetIcon },
          { title: "Balances", url: "/balances", icon: BankIcon },
          { title: "Beneficiaries", url: "/beneficiaries", icon: UsersIcon },
        ],
      },
      {
        title: "Payment Operations",
        items: [
          { title: "Payment Initiation", url: "/payments", icon: PaymentFlowIcon },
          { title: "Payment Approval", url: "/approvals", icon: ApprovalIcon, disabled: true },
          {
            title: "Reconciliation",
            url: "/reconciliation",
            icon: ReconciliationIcon,
            disabled: true,
          },
        ],
      },
      {
        title: "Today",
        items: [
          { title: "Requests", url: "/requests", icon: RequestsIcon, disabled: true },
          { title: "Approvals", url: "/approvals", icon: ApprovalIcon, disabled: true },
          { title: "Tasks", url: "/tasks", icon: TasksIcon, disabled: true },
          { title: "Chats", url: "/chats", icon: ChatIcon, disabled: true },
        ],
      },
      {
        title: "Integrations",
        items: [
          {
            title: "Payment Processor",
            url: "/integrations/payment-processor",
            icon: PaymentProcessorIcon,
            disabled: true,
          },
          {
            title: "Accounting",
            url: "/integrations/accounting",
            icon: AccountingIcon,
            disabled: true,
          },
          {
            title: "Merchant Platform",
            url: "/integrations/merchant-platform",
            icon: MerchantPlatformIcon,
            disabled: true,
          },
        ],
      },
    ],
  };
}

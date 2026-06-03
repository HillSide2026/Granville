import { createPortalIcon } from "@/components/ui/portal-icon";
import type { Organisation, SidebarData } from "../types";

export type PortalRole = "customer" | "ops" | "compliance" | "admin";

const BankIcon = createPortalIcon("bank");
const HomeIcon = createPortalIcon("home");
const PaymentFlowIcon = createPortalIcon("payment-flow");
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
        items: [
          { title: "Overview", url: "/", icon: HomeIcon },
        ],
      },
      {
        title: "Payment operations",
        items: [
          { title: "Balances", url: "/balances", icon: BankIcon },
          { title: "Payments", url: "/payments", icon: PaymentFlowIcon },
          { title: "Beneficiaries", url: "/beneficiaries", icon: UsersIcon },
        ],
      },
    ],
  };
}

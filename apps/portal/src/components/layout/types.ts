import type { LinkProps } from "@tanstack/react-router";

type Organisation = {
  name: string;
  workspaceName: string;
};

type BaseNavItem = {
  title: string;
  badge?: string;
  disabled?: boolean;
  icon?: React.ElementType;
};

type NavLink = BaseNavItem & {
  url: LinkProps["to"] | (string & {});
  items?: never;
};

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps["to"] | (string & {}) })[];
  url?: never;
};

type NavItem = NavCollapsible | NavLink;

type NavGroup = {
  title: string;
  items: NavItem[];
};

type SidebarData = {
  organisation: Organisation;
  navGroups: NavGroup[];
};

export type { NavCollapsible, NavGroup, NavItem, NavLink, Organisation, SidebarData };

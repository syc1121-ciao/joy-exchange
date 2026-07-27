import type { ReactNode } from "react";
import CmsShell from "@/components/CmsShell";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return <CmsShell>{children}</CmsShell>;
}
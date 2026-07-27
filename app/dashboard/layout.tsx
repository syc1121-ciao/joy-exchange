import type { ReactNode } from "react";

import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { requireAdmin } from "@/lib/requireAdmin";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-[#faf8f5]">
      <DashboardSidebar
        name={session.user?.name ?? "Admin"}
        email={session.user?.email ?? ""}
      />

      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
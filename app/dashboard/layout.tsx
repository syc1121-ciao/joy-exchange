import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/authOptions";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  const adminEmail = process.env.ADMIN_EMAIL
    ?.trim()
    .toLowerCase();

  const sessionEmail = session?.user?.email
    ?.trim()
    .toLowerCase();

  if (
    !sessionEmail ||
    sessionEmail !== adminEmail
  ) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#f5f2ed]">
      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[260px_1fr]">
        <DashboardSidebar />

        <main>{children}</main>
      </div>
    </div>
  );
}
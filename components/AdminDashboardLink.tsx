"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function AdminDashboardLink() {
  const { data: session } = useSession();

  if (!session?.user?.email) {
    return null;
  }

  return (
    <Link
      href="/admin-dashboard"
      className="text-xs uppercase tracking-[0.15em]"
    >
      Admin Dashboard
    </Link>
  );
}
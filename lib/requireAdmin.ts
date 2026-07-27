import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";

export async function requireAdmin() {
  const session =
    await getServerSession(authOptions);

  const adminEmail =
    process.env.ADMIN_EMAIL
      ?.trim()
      .toLowerCase();

  const sessionEmail =
    session?.user?.email
      ?.trim()
      .toLowerCase();

  if (
    !adminEmail ||
    !sessionEmail ||
    sessionEmail !== adminEmail
  ) {
    return null;
  }

  return session;
}
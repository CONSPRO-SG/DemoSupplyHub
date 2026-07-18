import { DashboardClient } from "@/components/dashboard-client";
import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const isAuthenticated = await isAuthenticatedNextjs();
  if (!isAuthenticated) {
    redirect("/");
  }
  return <DashboardClient />;
}

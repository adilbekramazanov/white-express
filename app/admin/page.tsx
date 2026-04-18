import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import AdminDashboard from "@/components/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const auth = await isAuthenticated();
  if (!auth) redirect("/admin/login");

  const { data: labels } = await supabase
    .from("labels")
    .select("*")
    .order("created_at", { ascending: false });

  const today = new Date().toISOString().split("T")[0];
  const todayCount = (labels ?? []).filter((l) =>
    l.created_at.startsWith(today)
  ).length;

  return (
    <AdminDashboard
      labels={labels ?? []}
      totalCount={labels?.length ?? 0}
      todayCount={todayCount}
    />
  );
}

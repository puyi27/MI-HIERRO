import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminConfigured, verifyAdminSession } from "@/lib/security/admin";
import { isServerlessRuntime } from "@/lib/runtime";
import { getStore } from "@/lib/store";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Panel operativo",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authorized = verifyAdminSession(cookieStore.get(ADMIN_COOKIE)?.value);

  if (!authorized) {
    return <AdminLogin localFallback={!isAdminConfigured() && !isServerlessRuntime()} />;
  }

  try {
    const store = await getStore();
    const [orders, leads, reports, users] = await Promise.all([
      store.listOrders(80),
      store.listLeads(80),
      store.listSimilarityRequests(80),
      store.listForgeUsers(200),
    ]);
    const usersWithDesigns = await Promise.all(
      users.map(async (user) => ({
        ...user,
        designs: await store.listDesignsForUser(user.id, 20),
      })),
    );

    return (
      <AdminDashboard
        orders={orders}
        leads={leads}
        reports={reports}
        users={usersWithDesigns}
        storeDriver={process.env.DATABASE_URL ? "prisma" : "file"}
        storeError={null}
      />
    );
  } catch {
    return (
      <AdminDashboard
        orders={[]}
        leads={[]}
        reports={[]}
        users={[]}
        storeDriver={process.env.DATABASE_URL ? "prisma" : "file"}
        storeError="almacén no disponible"
      />
    );
  }
}

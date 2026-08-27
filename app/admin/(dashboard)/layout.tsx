import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminSessionProvider } from "@/components/admin/AdminSessionProvider";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AdminSessionProvider>
      <div className="min-h-screen flex flex-col md:flex-row bg-bone">
        <Sidebar adminEmail={user?.email ?? ""} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </AdminSessionProvider>
  );

}


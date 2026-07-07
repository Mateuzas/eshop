import { redirect } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { AdminNavLink } from "@/components/admin/nav-link";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: <LayoutDashboard className="size-4" />,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: <Package className="size-4" />,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: <ShoppingCart className="size-4" />,
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // `src/proxy.ts` already redirects unauthenticated/non-admin visitors away
  // from `/admin/*`; this is just a fallback so the layout never renders for
  // a signed-out user (e.g. if middleware config ever changes).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/admin");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r bg-muted/30">
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-sm font-semibold tracking-tight">Admin</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => (
            <AdminNavLink key={item.href} {...item} />
          ))}
        </nav>
        <div className="border-t p-3">
          <p className="truncate px-2 pb-2 text-xs text-muted-foreground">
            {user.email}
          </p>
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start"
            >
              Sign out
            </Button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

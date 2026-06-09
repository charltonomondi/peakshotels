import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, BedDouble, CalendarDays, CreditCard, Users, FileText, LogOut, Settings, Calendar, BarChart3, Mountain, MessageSquare, Star } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const nav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/rooms", label: "Rooms", icon: BedDouble },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/admin/calendar", label: "Calendar", icon: Calendar },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/cms", label: "Website Content", icon: FileText },
  { to: "/admin/staff", label: "Staff & Roles", icon: Settings },
  { to: "/admin/mountain", label: "Mountain Bookings", icon: Mountain },
  { to: "/admin/loyalty", label: "Loyalty Program", icon: Star },
  { to: "/admin/lipa", label: "Lipa Mdogo Mdogo", icon: CreditCard },
  { to: "/admin/reviews", label: "Guest Reviews", icon: MessageSquare },
];

function AdminLayout() {
  const { user, loading, isStaff, signOut, roles } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthRoute = location.pathname.startsWith("/admin/login")
    || location.pathname.startsWith("/admin/signup")
    || location.pathname.startsWith("/admin/forgot-password")
    || location.pathname.startsWith("/admin/reset-password");

  useEffect(() => {
    if (loading || isAuthRoute) return;
    // Only redirect if definitely not authenticated
    if (!user) navigate({ to: "/admin/login" });
    // Do NOT redirect if user exists but roles are empty — could be a timing issue
    // The render below handles the "no role" case with a message
  }, [user, loading, isAuthRoute, navigate]);

  if (isAuthRoute) {
    return (<><Outlet /><Toaster richColors /></>);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Redirecting to login…
      </div>
    );
  }

  // User is authenticated but has no staff role
  if (!isStaff) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground text-sm mb-1">
            Your account (<strong>{user.email}</strong>) has no staff role assigned.
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            Ask a super admin to assign you a role, or run this in Supabase SQL Editor:
          </p>
          <pre className="text-xs bg-muted p-3 rounded text-left max-w-lg mx-auto mb-6 overflow-auto">
{`INSERT INTO public.user_roles (user_id, role)
VALUES ('${user.id}', 'super_admin');`}
          </pre>
        </div>
        <Button variant="outline" onClick={async () => { await signOut(); navigate({ to: "/admin/login" }); }}>
          <LogOut className="h-4 w-4 mr-2" /> Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <img src={logo} alt="Peaks Hotel" className="h-10 w-10 object-contain" />
          <div>
            <div className="font-semibold text-sm">Peaks Hotel</div>
            <div className="text-xs text-muted-foreground">Admin Panel</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => {
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to as any}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2 truncate">
            {user.email}
            <div className="text-[10px] uppercase tracking-wide">{roles.join(", ")}</div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={async () => { await signOut(); navigate({ to: "/admin/login" }); }}>
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      <Toaster richColors />
    </div>
  );
}

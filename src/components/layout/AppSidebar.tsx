import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Target, Package, Receipt, LogOut } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const items = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Leads", url: "/leads", icon: Target },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Products", url: "/products", icon: Package },
  { title: "Invoices", url: "/invoices", icon: Receipt },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const { user, isDemo, signOut } = useAuth();
  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-info flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">N</div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold tracking-tight leading-none">Nexus ERP</div>
              <div className="text-2xs text-muted-foreground mt-0.5">CRM &amp; Operations</div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink to={item.url} end={item.url === "/"}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className={cn("flex items-center gap-2 px-2 py-1.5", collapsed && "flex-col gap-1")}>
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-2xs font-semibold text-white shrink-0">
            {((user?.email ?? "U")[0]).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate leading-tight">{isDemo ? "Demo user" : user?.email ?? "Guest"}</div>
              <div className="text-2xs text-muted-foreground truncate">{isDemo ? "Demo mode" : "Signed in"}</div>
            </div>
          )}
          <button onClick={() => signOut()} className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" aria-label={isDemo ? "Exit demo" : "Sign out"} title={isDemo ? "Exit demo" : "Sign out"}>
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

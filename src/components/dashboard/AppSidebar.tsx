import { FolderOpen, PlusCircle, BarChart3, Settings, Zap } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "My Projects", url: "/dashboard", icon: FolderOpen },
  { title: "Create Project", url: "/create", icon: PlusCircle },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-lg">F</span>
            </div>
            {!collapsed && (
              <span className="font-bold text-lg text-foreground">FairGrade</span>
            )}
          </a>
        </div>

        {/* Navigation */}
        <SidebarGroup className="flex-1">
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Upgrade CTA */}
        {!collapsed && (
          <div className="p-4 border-t border-border">
            <div className="bg-gradient-hero rounded-xl p-4 text-primary-foreground">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5" />
                <span className="font-semibold">Upgrade to Pro</span>
              </div>
              <p className="text-sm text-primary-foreground/80 mb-3">
                Unlimited projects + advanced analytics
              </p>
              <Button variant="hero" size="sm" className="w-full">
                Upgrade Now
              </Button>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

import { FolderOpen, PlusCircle, BarChart3, Settings, Zap, Eye, Flag } from "lucide-react";
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
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "My Projects", url: "/dashboard", icon: FolderOpen },
  { title: "Create Project", url: "/create", icon: PlusCircle },
  { title: "Live Monitor", url: "/live-monitor", icon: Eye, pulse: true },
  { title: "Flags & Alerts", url: "/flags", icon: Flag, badge: 3 },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');

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
                      end={item.url === "/dashboard" || item.url === "/create"}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <div className="relative">
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {item.pulse && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full animate-pulse" />
                        )}
                      </div>
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && item.badge > 0 && (
                            <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full font-medium">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
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
            <div className="bg-gradient-to-br from-warning to-orange-500 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5" />
                <span className="font-bold">Upgrade to Pro</span>
              </div>
              <p className="text-sm text-white/90 mb-3">
                Unlimited projects + AI detection
              </p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full bg-white text-orange-600 hover:bg-gray-100 shadow-md font-semibold"
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

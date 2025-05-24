"use client";

import * as React from "react";
import { useMemo } from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Forward,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

// This is sample data.
const main_data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Arxiv Research",
      logo: GalleryVerticalEnd,
      plan: "Academy",
    },
  ],
  navMain: [
    {
      title: "Projects",
      url: "/workspaces",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Workspaces",
          url: "/workspaces",
        },
        {
          title: "Arxiv",
          url: "/arxiv",
        },
        {
          title: "Paper",
          url: "/paper",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, userWorkspaces, isMobile, setOpenMobile } = useSidebar(); // Get isMobile and setOpenMobile

  // Memoize the projects prop
  const projects = useMemo(() => {
    return userWorkspaces
      ? userWorkspaces?.map((ws) => ({
          id: ws.id,
          name: ws.name,
          url: `/workspaces/${ws.id}`,
          icon: Forward,
        }))
      : [];
  }, [userWorkspaces]);

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <TeamSwitcher teams={main_data.teams} />
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={main_data.navMain} isMobile={isMobile} setOpenMobile={setOpenMobile} />
          {/* <NavProjects
            projects={
              workspaces
                ? workspaces?.map((ws) => ({
                    id: ws.id,
                    name: ws.name,
                    url: `/workspaces/${ws.id}`,
                    icon: Forward,
                  }))
                : []
            }
          /> */}
          <NavProjects projects={projects} isMobile={isMobile} setOpenMobile={setOpenMobile} />
        </SidebarContent>
        <SidebarFooter>
          {
            <NavUser
              user={{
                name: user?.name,
                email: user?.email,
                avatar: user?.avatar,
              }}
            />
          }
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
}

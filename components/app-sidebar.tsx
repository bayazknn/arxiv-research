"use client";

import * as React from "react";
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
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Workspace } from "@/types/workspace";

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
  const [user, setUser] = useState<any | null>(null);
  const [workspaces, setWorkpaces] = useState<Workspace[] | null>([]);
  const supabase = createClient();

  useEffect(() => {
    const getUserData = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user data:", error);
        return {
          user: {
            name: "guest",
            email: "guest@example.com",
            avatar: "/avatar.jpg",
          },
        };
      } else {
        setUser({
          user: {
            name: data.user.email,
            email: data.user.email,
            avatar: "/avatar.jpg",
          },
        });
        return data;
      }
    };
    getUserData();

    const getWorkspaceData = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("workspaces").select().eq("user_id", userData?.user?.id);
      if (data) {
        setWorkpaces(data);
      }
    };
    getWorkspaceData();
  }, []);

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <TeamSwitcher teams={main_data.teams} />
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={main_data.navMain} />
          <NavProjects
            projects={
              workspaces
                ? workspaces?.map((ws) => ({
                    name: ws.name,
                    url: `/workspaces/${ws.id}`,
                    icon: Forward,
                  }))
                : []
            }
          />
        </SidebarContent>
        <SidebarFooter>
          {
            <NavUser
              user={{
                name: user?.user?.name,
                email: user?.user?.email,
                avatar: user?.user?.avatar,
              }}
            />
          }
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
}

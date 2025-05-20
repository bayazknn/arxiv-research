"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
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

// This is sample data.
const main_data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
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
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
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
  const supabase = createClient();

  useEffect(() => {
    const getUserData = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user data:", error);
        return {
          user: {
            name: "shadcn",
            email: "m@example.com",
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
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={main_data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={main_data.navMain} />
        <NavProjects projects={main_data.projects} />
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
  );
}

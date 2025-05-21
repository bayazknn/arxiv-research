"use client";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Geist } from "next/font/google";
import { usePathname } from "next/navigation";

const defaultUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

// export const metadata = {
//   metadataBase: new URL(defaultUrl),
//   title: "Next.js and Supabase Starter Kit",
//   description: "The fastest way to build apps with Next.js and Supabase",
// };

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const pathnameList = pathname?.split("/");
  return (
    <html className={geistSans.className} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/highlight.css" />
      </head>
      <body>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <div className="h-screen overflow-hidden">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}

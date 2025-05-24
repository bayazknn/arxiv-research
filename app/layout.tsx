"use client";

import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Geist } from "next/font/google";
import { usePathname } from "next/navigation";

// const defaultUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

// export const metadata = {
//   metadataBase: new URL(defaultUrl),
//   title: "Arxiv Research",
//   description: "Arxiv Research",
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
  return (
    <html className={geistSans.className} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/highlight.css" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage =
    pathname?.includes("/sign-in") || pathname?.includes("/sign-up") || pathname?.includes("/forgot-password");

  if (isAuthPage) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="h-screen overflow-hidden">{children}</div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </>
  );
}

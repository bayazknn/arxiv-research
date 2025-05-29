

import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Geist } from "next/font/google";
// import { usePathname } from "next/navigation";
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';


const defaultUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Arxiv Research",
  description: "Arxiv Research",
};



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
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
      </body>
    </html>
  );
}

function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />


        <SidebarInset>
          {children}
        </SidebarInset>

      </SidebarProvider>
      <Toaster />
    </>
  );
}

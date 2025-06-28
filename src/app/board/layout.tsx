
<!-- import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
} -->

"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { BreadcrumbProvider } from "@/contexts/breadcrumb.context";
import { AppSidebar } from "@/components/shared/navigation/app.sidebar";
import AdminHeader from "@/components/shared/navigation/admin-header";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // First, guarantee we're client-side before attempting authentication
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  // Only after confirming we're client-side, check for the token
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;


  return (
      <SidebarProvider>
      <BreadcrumbProvider>
        <AppSidebar />
        <SidebarInset className="overflow-hidden px-4 md:px-6 lg:px-8">
          <AdminHeader />
            {children}
        </SidebarInset>
      </BreadcrumbProvider>
    </SidebarProvider>
  );
}

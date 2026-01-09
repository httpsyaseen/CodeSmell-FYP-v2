"use client";

import { AppSidebar } from "@/components/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import Loading from "@/components/loading";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <Loading />;
  }

  return isAuthenticated ? (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full ">{children}</div>
    </SidebarProvider>
  ) : null;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { LoadingScreen } from "@/components/loading-screen";

export default function LabTechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (!user.roles.includes("LAB_TECHNICIAN")) {
        // Redirect to appropriate dashboard based on role
        if (user.roles.includes("PATIENT")) {
          router.push("/patient/dashboard");
        } else if (user.roles.includes("DOCTOR")) {
          router.push("/doctor/dashboard");
        } else if (user.roles.includes("RECEPTIONIST")) {
          router.push("/receptionist/dashboard");
        } else if (user.roles.includes("PATHOLOGIST")) {
          router.push("/pathologist/dashboard");
        } else {
          router.push("/login");
        }
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user || !user.roles.includes("LAB_TECHNICIAN")) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

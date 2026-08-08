"use client";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { apiFetch, getUser } from "@/lib/apiClient";
import AdminPanel from "@/components/dashboard/AdminPanel";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "MODERATOR"];

export default function AdminPage() {
  const router = useRouter();
  const [status, setStatus] = useState("checking"); // checking | allowed | denied

  useEffect(() => {
    const localUser = getUser();
    if (!localUser) {
      router.replace("/login");
      return;
    }
    // Never trust localStorage role alone — re-verify against the server on every load.
    apiFetch("/api/users/me")
      .then((data) => {
        const role = data?.user?.role;
        if (role && ADMIN_ROLES.includes(role)) {
          setStatus("allowed");
        } else {
          setStatus("denied");
          router.replace("/dashboard");
        }
      })
      .catch(() => {
        setStatus("denied");
        router.replace("/login");
      });
  }, [router]);

  if (status !== "allowed") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-400 text-sm">Yoxlanılır...</div>
      </div>
    );
  }

  return <AdminPanel />;
}

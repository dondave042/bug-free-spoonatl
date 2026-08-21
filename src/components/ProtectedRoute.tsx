import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useStore } from "../lib/store";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { user, isAdmin, adminCheckComplete } = useStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !adminCheckComplete) {
    return <div className="flex min-h-screen items-center justify-center text-sm font-semibold text-slate-500">Checking admin access...</div>;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/user/dashboard" replace />;
  }

  return <>{children}</>;
}

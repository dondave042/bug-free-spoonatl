import { Navigate } from "react-router-dom";
import { useStore } from "../lib/store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { user, isAdmin } = useStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/user/dashboard" replace />;
  }

  return <>{children}</>;
}

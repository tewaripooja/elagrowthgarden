import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DynamicSky from "@/components/DynamicSky";
import { PAGE_SHELL_GRADIENT } from "@/lib/pageTheme";
import { cn } from "@/lib/utils";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <DynamicSky>
        <div className={cn("min-h-screen w-full flex flex-col items-center justify-center", PAGE_SHELL_GRADIENT)}>
          <p className="text-cyan-50 font-medium drop-shadow-sm">Loading…</p>
        </div>
      </DynamicSky>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

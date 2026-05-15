import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DynamicSky from "@/components/DynamicSky";
import { canStartGuestStory } from "@/lib/guestTrial";
import { PAGE_SHELL_GRADIENT } from "@/lib/pageTheme";
import { cn } from "@/lib/utils";
import Index from "./Index";

/** Logged-in home, or guest trial redirect to Story Time, or login after free story. */
export default function HomeEntry() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <DynamicSky>
        <div className={cn("min-h-screen w-full flex flex-col items-center justify-center", PAGE_SHELL_GRADIENT)}>
          <p className="text-cyan-50 font-medium drop-shadow-sm">Loading…</p>
        </div>
      </DynamicSky>
    );
  }

  if (session) {
    return <Index />;
  }

  if (canStartGuestStory()) {
    return (
      <Navigate
        to="/activity"
        replace
        state={{ fromReading: true, guestTrial: true }}
      />
    );
  }

  return <Navigate to="/login" replace state={{ reason: "guest_trial" }} />;
}

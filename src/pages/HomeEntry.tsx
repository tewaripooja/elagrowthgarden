import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DynamicSky from "@/components/DynamicSky";
import { PAGE_SHELL_GRADIENT } from "@/lib/pageTheme";
import { cn } from "@/lib/utils";
import { getGradeLevel, setGradeLevel, type GradeLevel } from "@/lib/gradeLevel";
import { supabase } from "@/integrations/supabase/client";
import Index from "./Index";
import GradeSelector from "./GradeSelector";

/** Home — requires auth. Shows GradeSelector on first login, then Index. */
export default function HomeEntry() {
  const { session, loading } = useAuth();
  const location = useLocation();
  const [gradeReady, setGradeReady] = useState(() => getGradeLevel() !== null);
  const [gradeSynced, setGradeSynced] = useState(false);

  // Sync grade from Supabase user_metadata → localStorage after login
  useEffect(() => {
    if (!session?.user) { setGradeSynced(true); return; }
    const metaGrade = session.user.user_metadata?.grade_level as number | undefined;
    if (metaGrade && metaGrade >= 1 && metaGrade <= 5) {
      setGradeLevel(metaGrade as GradeLevel);
      setGradeReady(true);
    }
    setGradeSynced(true);
  }, [session?.user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGradeSelect = async (grade: GradeLevel) => {
    setGradeLevel(grade);
    // Persist to user metadata so it survives across devices/sessions
    if (session?.user) {
      await supabase.auth.updateUser({ data: { grade_level: grade } });
    }
    setGradeReady(true);
  };

  if (loading || (session && !gradeSynced)) {
    return (
      <DynamicSky>
        <div className={cn("min-h-screen w-full flex flex-col items-center justify-center", PAGE_SHELL_GRADIENT)}>
          <p className="text-cyan-50 font-medium drop-shadow-sm">Loading…</p>
        </div>
      </DynamicSky>
    );
  }

  // Require login
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!gradeReady) {
    return <GradeSelector onSelect={handleGradeSelect} />;
  }

  return <Index />;
}

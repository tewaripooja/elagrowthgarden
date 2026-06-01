import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DynamicSky from "@/components/DynamicSky";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth state changes — supabase-js processes the URL hash automatically
    // when detectSessionInUrl = true. We react to the resulting event.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // Forgot-password link: go to the reset form (session is active so user can call updateUser)
        navigate("/reset-password", { replace: true });
      } else if (session) {
        // Normal login / signup confirmation
        navigate("/", { replace: true });
      }
    });

    // Fallback: if no event fires within 3 s, check session and navigate
    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      navigate(session ? "/" : "/login", { replace: true });
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <DynamicSky>
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
        <div style={{ fontSize:48 }}>🌱</div>
        <div style={{ fontSize:16, fontWeight:700, color:"#fff", fontFamily:"'Nunito',sans-serif", textShadow:"0 2px 6px rgba(0,0,0,.2)" }}>
          Signing you in…
        </div>
      </div>
    </DynamicSky>
  );
}

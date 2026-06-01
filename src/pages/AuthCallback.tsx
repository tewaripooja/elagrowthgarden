import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DynamicSky from "@/components/DynamicSky";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // With implicit flow, supabase-js automatically picks up the
    // access_token from the URL hash when detectSessionInUrl = true.
    // We just need to wait briefly for the session to be set, then redirect.
    const finish = async () => {
      // Give the client a moment to parse the hash and store the session
      await new Promise((r) => setTimeout(r, 500));

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    };

    void finish();
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

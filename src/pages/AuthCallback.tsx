import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DynamicSky from "@/components/DynamicSky";
import { supabase } from "@/integrations/supabase/client";
import { PAGE_SHELL_GRADIENT } from "@/lib/pageTheme";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const finish = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          toast.error(error.message);
          navigate("/login", { replace: true });
          return;
        }
      }

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        toast.error(error.message);
        navigate("/login", { replace: true });
        return;
      }
      if (session) {
        navigate("/", { replace: true });
        return;
      }

      await new Promise((r) => setTimeout(r, 250));
      const { data: retry } = await supabase.auth.getSession();
      if (retry.session) {
        navigate("/", { replace: true });
        return;
      }

      toast.info("Could not complete sign-in. Try again.");
      navigate("/login", { replace: true });
    };

    void finish();
  }, [navigate]);

  return (
    <DynamicSky>
      <div className={cn("min-h-screen w-full flex flex-col items-center justify-center", PAGE_SHELL_GRADIENT)}>
        <p className="text-cyan-50 font-medium drop-shadow-sm">Signing you in…</p>
      </div>
    </DynamicSky>
  );
}

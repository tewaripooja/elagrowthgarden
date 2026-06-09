import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import DynamicSky from "@/components/DynamicSky";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
type FormValues = z.infer<typeof schema>;
type LocationState = { from?: { pathname: string }; reason?: string };

const font = "'Nunito',sans-serif";

export default function Login() {
  const { session, loading } = useAuth();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const locationState = location.state as LocationState | null;
  const from = locationState?.from?.pathname ?? "/";
  const guestEnded = locationState?.reason === "guest_trial";

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  if (loading) return (
    <DynamicSky>
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontSize:15, fontWeight:700, color:"#fff", fontFamily:font }}>Loading…</div>
      </div>
    </DynamicSky>
  );

  if (session) return <Navigate to={from} replace />;

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { toast.error(error.message); setGoogleLoading(false); }
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email.trim(),
        password: values.password,
      });
      if (error) {
        const msg = error.message?.toLowerCase() ?? "";
        toast.error(msg.includes("email not confirmed")
          ? "Please confirm your email first. Check your inbox."
          : error.message);
        return;
      }
      toast.success("Welcome back! 🌱");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DynamicSky>
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 16px" }}>

        {/* Card */}
        <div style={{ width:"100%", maxWidth:420, background:"#fff", borderRadius:24, boxShadow:"0 12px 40px rgba(0,0,0,.16)", overflow:"hidden" }}>

          {/* Green header */}
          <div style={{ background:"linear-gradient(135deg,#5BBD4E,#27ae60)", padding:"28px 28px 24px", textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:8 }}>🌱</div>
            <div style={{ fontSize:22, fontWeight:900, color:"#fff", fontFamily:font, textShadow:"0 2px 6px rgba(0,0,0,.2)" }}>
              ELA Growth Garden
            </div>
            <div style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,.85)", marginTop:4, fontFamily:font }}>
              {guestEnded
                ? "Sign in to save your garden progress!"
                : "Welcome back! Sign in to continue 🌸"}
            </div>
          </div>

          {/* Body */}
          <div style={{ padding:"24px 28px 28px" }}>

            {/* Google button */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              style={{
                width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                background:"#fff", border:"2px solid #e0e0e0", borderRadius:14,
                padding:"12px 16px", fontSize:15, fontWeight:700, color:"#3a3a3a",
                cursor: googleLoading ? "not-allowed" : "pointer", fontFamily:font,
                boxShadow:"0 2px 8px rgba(0,0,0,.08)", transition:"box-shadow .15s, border-color .15s",
                marginBottom:20, opacity: googleLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor="#4285F4"; (e.currentTarget as HTMLButtonElement).style.boxShadow="0 4px 12px rgba(66,133,244,.2)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor="#e0e0e0"; (e.currentTarget as HTMLButtonElement).style.boxShadow="0 2px 8px rgba(0,0,0,.08)"; }}
            >
              {/* Google logo SVG */}
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              {googleLoading ? "Connecting…" : "Continue with Google"}
            </button>

            {/* Divider */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
              <div style={{ flex:1, height:1, background:"#e8e8e8" }}/>
              <span style={{ fontSize:12, fontWeight:600, color:"#aaa", fontFamily:font }}>or with email</span>
              <div style={{ flex:1, height:1, background:"#e8e8e8" }}/>
            </div>

            {/* Email/password form */}
            <form onSubmit={handleSubmit(onSubmit)} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={{ fontSize:13, fontWeight:700, color:"#3a3a3a", fontFamily:font, display:"block", marginBottom:5 }}>Email</label>
                <input
                  type="email" autoComplete="email" placeholder="you@example.com"
                  {...register("email")}
                  style={{ width:"100%", border:`2px solid ${errors.email ? "#e74c3c" : "#e0e0e0"}`, borderRadius:12, padding:"11px 14px", fontSize:14, fontFamily:font, outline:"none", boxSizing:"border-box", transition:"border-color .15s" }}
                  onFocus={(e) => { e.target.style.borderColor="#5BBD4E"; }}
                  onBlur={(e) => { e.target.style.borderColor = errors.email ? "#e74c3c" : "#e0e0e0"; }}
                />
                {errors.email && <div style={{ fontSize:12, color:"#e74c3c", marginTop:3, fontFamily:font }}>{errors.email.message}</div>}
              </div>

              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                  <label style={{ fontSize:13, fontWeight:700, color:"#3a3a3a", fontFamily:font }}>Password</label>
                  <Link to="/forgot-password" style={{ fontSize:12, color:"#5BBD4E", fontWeight:600, textDecoration:"none", fontFamily:font }}>Forgot password?</Link>
                </div>
                <input
                  type="password" autoComplete="current-password"
                  {...register("password")}
                  style={{ width:"100%", border:`2px solid ${errors.password ? "#e74c3c" : "#e0e0e0"}`, borderRadius:12, padding:"11px 14px", fontSize:14, fontFamily:font, outline:"none", boxSizing:"border-box", transition:"border-color .15s" }}
                  onFocus={(e) => { e.target.style.borderColor="#5BBD4E"; }}
                  onBlur={(e) => { e.target.style.borderColor = errors.password ? "#e74c3c" : "#e0e0e0"; }}
                />
                {errors.password && <div style={{ fontSize:12, color:"#e74c3c", marginTop:3, fontFamily:font }}>{errors.password.message}</div>}
              </div>

              <button
                type="submit" disabled={submitting}
                style={{ background: submitting ? "#aaa" : "linear-gradient(135deg,#5BBD4E,#27ae60)", color:"#fff", border:"none", borderRadius:14, padding:"13px", fontSize:15, fontWeight:800, cursor: submitting ? "not-allowed" : "pointer", fontFamily:font, boxShadow:"0 5px 0 0 rgba(22,163,74,.35)", transition:"transform .15s" }}
                onMouseEnter={(e) => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.transform="translateY(-2px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform=""; }}
              >
                {submitting ? "Signing in…" : "Sign in 🌱"}
              </button>
            </form>

            {/* Footer links */}
            <div style={{ marginTop:20, textAlign:"center", fontSize:13, fontWeight:600, color:"#888", fontFamily:font }}>
              New here?{" "}
              <Link to="/signup" style={{ color:"#27ae60", fontWeight:800, textDecoration:"none" }}>Create an account</Link>
            </div>
            <div style={{ marginTop:8, textAlign:"center" }}>
              <Link to="/signup" style={{ fontSize:12, color:"#aaa", fontFamily:font, textDecoration:"none" }}>← Create an account instead</Link>
            </div>
            <div style={{ marginTop:8, textAlign:"center" }}>
              <Link to="/privacy-policy" style={{ fontSize:12, color:"#aaa", fontFamily:font, textDecoration:"none" }}>Privacy Policy</Link>
              {" · "}
              <Link to="/delete-account" style={{ fontSize:12, color:"#aaa", fontFamily:font, textDecoration:"none" }}>Delete Account</Link>
            </div>
          </div>
        </div>
      </div>
    </DynamicSky>
  );
}

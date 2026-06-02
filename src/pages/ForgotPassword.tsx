import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import DynamicSky from "@/components/DynamicSky";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormValues = z.infer<typeof schema>;
const font = "'Nunito',sans-serif";

export default function ForgotPassword() {
  const { session, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  if (loading) return (
    <DynamicSky>
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontSize:15, fontWeight:700, color:"#fff", fontFamily:font }}>Loading…</div>
      </div>
    </DynamicSky>
  );

  if (session) return <Navigate to="/" replace />;

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (error) { toast.error(error.message); return; }
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DynamicSky>
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 16px" }}>
        <div style={{ width:"100%", maxWidth:420, background:"#fff", borderRadius:24, boxShadow:"0 12px 40px rgba(0,0,0,.16)", overflow:"hidden" }}>

          <div style={{ background:"linear-gradient(135deg,#5BBD4E,#27ae60)", padding:"28px 28px 24px", textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:8 }}>{sent ? "📬" : "🔑"}</div>
            <div style={{ fontSize:20, fontWeight:900, color:"#fff", fontFamily:font, textShadow:"0 2px 6px rgba(0,0,0,.2)" }}>
              {sent ? "Email sent!" : "Forgot password?"}
            </div>
            <div style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,.85)", marginTop:4, fontFamily:font }}>
              {sent ? "Check your inbox for the reset link" : "No worries — we'll send you a reset link"}
            </div>
          </div>

          <div style={{ padding:"24px 28px 28px" }}>
            {sent ? (
              <>
                <p style={{ fontSize:14, fontWeight:600, color:"#3a5a3a", fontFamily:font, lineHeight:1.6, textAlign:"center", marginBottom:20 }}>
                  Click the link in your email to set a new password, then sign back in!
                </p>
                <Link to="/login" style={{ display:"block", background:"linear-gradient(135deg,#5BBD4E,#27ae60)", color:"#fff", borderRadius:14, padding:"13px", fontSize:15, fontWeight:800, textDecoration:"none", fontFamily:font, textAlign:"center" }}>
                  Back to Sign in 🌱
                </Link>
              </>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div>
                  <label style={{ fontSize:13, fontWeight:700, color:"#3a3a3a", fontFamily:font, display:"block", marginBottom:5 }}>
                    Your email address
                  </label>
                  <input
                    type="email" autoComplete="email" placeholder="you@example.com"
                    {...register("email")}
                    style={{ width:"100%", border:`2px solid ${errors.email ? "#e74c3c" : "#e0e0e0"}`, borderRadius:12, padding:"11px 14px", fontSize:14, fontFamily:font, outline:"none", boxSizing:"border-box", transition:"border-color .15s" }}
                    onFocus={(e) => { e.target.style.borderColor="#5BBD4E"; }}
                    onBlur={(e) => { e.target.style.borderColor = errors.email ? "#e74c3c" : "#e0e0e0"; }}
                  />
                  {errors.email && <div style={{ fontSize:12, color:"#e74c3c", marginTop:3, fontFamily:font }}>{errors.email.message}</div>}
                </div>

                <button
                  type="submit" disabled={submitting}
                  style={{ background: submitting ? "#aaa" : "linear-gradient(135deg,#5BBD4E,#27ae60)", color:"#fff", border:"none", borderRadius:14, padding:"13px", fontSize:15, fontWeight:800, cursor: submitting ? "not-allowed" : "pointer", fontFamily:font, boxShadow:"0 5px 0 0 rgba(22,163,74,.35)", transition:"transform .15s" }}
                  onMouseEnter={(e) => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.transform="translateY(-2px)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform=""; }}
                >
                  {submitting ? "Sending…" : "Send reset link 📧"}
                </button>

                <div style={{ textAlign:"center", fontSize:13, fontWeight:600, color:"#888", fontFamily:font, marginTop:4 }}>
                  Remembered it?{" "}
                  <Link to="/login" style={{ color:"#27ae60", fontWeight:800, textDecoration:"none" }}>Sign in</Link>
                </div>
              </form>
            )}
            <div style={{ marginTop:16, textAlign:"center" }}>
              <Link to="/login" style={{ fontSize:12, color:"#aaa", fontFamily:font, textDecoration:"none" }}>← Back to sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </DynamicSky>
  );
}

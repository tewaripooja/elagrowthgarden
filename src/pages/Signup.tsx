import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
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

const font = "'Nunito',sans-serif";

async function recordConsent(userId: string) {
  await supabase.from("parental_consents").insert({
    user_id: userId,
    consent_version: "1.0",
    user_agent: navigator.userAgent.slice(0, 200),
  });
}

export default function Signup() {
  const { session, loading } = useAuth();
  const [submitting, setSubmitting]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [done, setDone]                   = useState(false);
  const [isParent, setIsParent]           = useState(false);
  const [agreePrivacy, setAgreePrivacy]   = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
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

  if (session) return <Navigate to="/" replace />;

  const consentReady = isParent && agreePrivacy;

  const handleGoogle = async () => {
    if (!consentReady) {
      toast.error("Please confirm you are a parent/guardian and accept the Privacy Policy first.");
      return;
    }
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "consent" },
      },
    });
    if (error) { toast.error(error.message); setGoogleLoading(false); }
  };

  const onSubmit = async (values: FormValues) => {
    if (!consentReady) {
      toast.error("Please confirm you are a parent/guardian and accept the Privacy Policy.");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { parental_consent: true, consent_version: "1.0", consent_given_at: new Date().toISOString() },
        },
      });
      if (error) { toast.error(error.message); return; }

      // Record consent in the parental_consents table if we already have a session
      if (data.session?.user) {
        await recordConsent(data.session.user.id);
        toast.success("Account created! Welcome to ELA Growth Garden 🌱");
      } else if (data.user) {
        // Email confirmation required — consent will be recorded after confirmation
        setDone(true);
        reset();
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Success state — email sent
  if (done) return (
    <DynamicSky>
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 16px" }}>
        <div style={{ width:"100%", maxWidth:420, background:"#fff", borderRadius:24, boxShadow:"0 12px 40px rgba(0,0,0,.16)", overflow:"hidden" }}>
          <div style={{ background:"linear-gradient(135deg,#5BBD4E,#27ae60)", padding:"28px 28px 24px", textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:8 }}>📬</div>
            <div style={{ fontSize:20, fontWeight:900, color:"#fff", fontFamily:font }}>Check your email!</div>
          </div>
          <div style={{ padding:"24px 28px 28px", textAlign:"center" }}>
            <p style={{ fontSize:14, fontWeight:600, color:"#3a5a3a", fontFamily:font, lineHeight:1.6, marginBottom:20 }}>
              We sent a confirmation link to your inbox.<br/>Click it to activate your account, then sign in!
            </p>
            <Link to="/login" style={{ display:"block", background:"linear-gradient(135deg,#5BBD4E,#27ae60)", color:"#fff", borderRadius:14, padding:"13px", fontSize:15, fontWeight:800, textDecoration:"none", fontFamily:font, textAlign:"center" }}>
              Go to Sign in 🌱
            </Link>
          </div>
        </div>
      </div>
    </DynamicSky>
  );

  return (
    <DynamicSky>
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 16px" }}>

        <div style={{ width:"100%", maxWidth:440, background:"#fff", borderRadius:24, boxShadow:"0 12px 40px rgba(0,0,0,.16)", overflow:"hidden" }}>

          {/* Green header */}
          <div style={{ background:"linear-gradient(135deg,#5BBD4E,#27ae60)", padding:"28px 28px 24px", textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:8 }}>🌱</div>
            <div style={{ fontSize:22, fontWeight:900, color:"#fff", fontFamily:font, textShadow:"0 2px 6px rgba(0,0,0,.2)" }}>
              Join ELA Growth Garden
            </div>
            <div style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,.85)", marginTop:4, fontFamily:font }}>
              For parents &amp; guardians setting up a child's account
            </div>
          </div>

          <div style={{ padding:"24px 28px 28px" }}>

            {/* ── COPPA consent section ── */}
            <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:14, padding:"16px 18px", marginBottom:22 }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#166534", fontFamily:font, marginBottom:12 }}>
                Before creating an account, please confirm:
              </p>

              <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer", marginBottom:12 }}>
                <input
                  type="checkbox"
                  checked={isParent}
                  onChange={e => setIsParent(e.target.checked)}
                  style={{ marginTop:2, accentColor:"#27ae60", width:16, height:16, flexShrink:0 }}
                />
                <span style={{ fontSize:13, color:"#1a3d1f", fontFamily:font, lineHeight:1.6 }}>
                  I am a <strong>parent or guardian (18+)</strong> and I am creating this account
                  on behalf of my child.
                </span>
              </label>

              <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer" }}>
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={e => setAgreePrivacy(e.target.checked)}
                  style={{ marginTop:2, accentColor:"#27ae60", width:16, height:16, flexShrink:0 }}
                />
                <span style={{ fontSize:13, color:"#1a3d1f", fontFamily:font, lineHeight:1.6 }}>
                  I have read and agree to the{" "}
                  <Link to="/privacy-policy" target="_blank" style={{ color:"#16a34a", fontWeight:700, textDecoration:"underline" }}>
                    Privacy Policy
                  </Link>
                  , including the collection and use of my child's learning data.
                </span>
              </label>
            </div>

            {/* Google button */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading || !consentReady}
              style={{
                width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                background: consentReady ? "#fff" : "#f5f5f5",
                border:"2px solid #e0e0e0", borderRadius:14,
                padding:"12px 16px", fontSize:15, fontWeight:700, color: consentReady ? "#3a3a3a" : "#aaa",
                cursor: googleLoading || !consentReady ? "not-allowed" : "pointer", fontFamily:font,
                boxShadow:"0 2px 8px rgba(0,0,0,.08)", marginBottom:20,
                opacity: googleLoading ? 0.7 : 1,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              {googleLoading ? "Connecting…" : "Sign up with Google"}
            </button>

            {/* Divider */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
              <div style={{ flex:1, height:1, background:"#e8e8e8" }}/>
              <span style={{ fontSize:12, fontWeight:600, color:"#aaa", fontFamily:font }}>or with email</span>
              <div style={{ flex:1, height:1, background:"#e8e8e8" }}/>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={{ fontSize:13, fontWeight:700, color:"#3a3a3a", fontFamily:font, display:"block", marginBottom:5 }}>
                  Parent / Guardian Email
                </label>
                <input
                  type="email" autoComplete="email" placeholder="you@example.com"
                  {...register("email")}
                  style={{ width:"100%", border:`2px solid ${errors.email ? "#e74c3c" : "#e0e0e0"}`, borderRadius:12, padding:"11px 14px", fontSize:14, fontFamily:font, outline:"none", boxSizing:"border-box" }}
                  onFocus={e => { e.target.style.borderColor="#5BBD4E"; }}
                  onBlur={e => { e.target.style.borderColor = errors.email ? "#e74c3c" : "#e0e0e0"; }}
                />
                {errors.email && <div style={{ fontSize:12, color:"#e74c3c", marginTop:3, fontFamily:font }}>{errors.email.message}</div>}
              </div>

              <div>
                <label style={{ fontSize:13, fontWeight:700, color:"#3a3a3a", fontFamily:font, display:"block", marginBottom:5 }}>
                  Password <span style={{ color:"#aaa", fontWeight:500 }}>(min 6 characters)</span>
                </label>
                <input
                  type="password" autoComplete="new-password"
                  {...register("password")}
                  style={{ width:"100%", border:`2px solid ${errors.password ? "#e74c3c" : "#e0e0e0"}`, borderRadius:12, padding:"11px 14px", fontSize:14, fontFamily:font, outline:"none", boxSizing:"border-box" }}
                  onFocus={e => { e.target.style.borderColor="#5BBD4E"; }}
                  onBlur={e => { e.target.style.borderColor = errors.password ? "#e74c3c" : "#e0e0e0"; }}
                />
                {errors.password && <div style={{ fontSize:12, color:"#e74c3c", marginTop:3, fontFamily:font }}>{errors.password.message}</div>}
              </div>

              <button
                type="submit" disabled={submitting || !consentReady}
                style={{ background: submitting || !consentReady ? "#aaa" : "linear-gradient(135deg,#5BBD4E,#27ae60)", color:"#fff", border:"none", borderRadius:14, padding:"13px", fontSize:15, fontWeight:800, cursor: submitting || !consentReady ? "not-allowed" : "pointer", fontFamily:font, boxShadow:"0 5px 0 0 rgba(22,163,74,.35)" }}
              >
                {submitting ? "Creating account…" : "Create account 🌱"}
              </button>
            </form>

            <div style={{ marginTop:20, textAlign:"center", fontSize:13, fontWeight:600, color:"#888", fontFamily:font }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color:"#27ae60", fontWeight:800, textDecoration:"none" }}>Sign in</Link>
            </div>
            <div style={{ marginTop:8, textAlign:"center" }}>
              <Link to="/privacy-policy" style={{ fontSize:12, color:"#aaa", fontFamily:font, textDecoration:"none" }}>Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </DynamicSky>
  );
}

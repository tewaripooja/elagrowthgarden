import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DynamicSky from "@/components/DynamicSky";
import { supabase } from "@/integrations/supabase/client";

const font = "'Nunito',sans-serif";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]           = useState(false);
  // Wait up to 3 s for the recovery session to arrive before showing error
  const [sessionReady, setSessionReady] = useState(false);
  const [hasSession, setHasSession]     = useState(false);

  useEffect(() => {
    // Check if a session already exists (e.g. navigated here from AuthCallback)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setHasSession(true); setSessionReady(true); }
    });

    // Also listen for the PASSWORD_RECOVERY event arriving slightly later
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasSession(true);
        setSessionReady(true);
      }
    });

    // Timeout fallback — if no session after 3 s, show the expired error
    const timer = setTimeout(() => setSessionReady(true), 3000);

    return () => { subscription.unsubscribe(); clearTimeout(timer); };
  }, []);

  if (!sessionReady) {
    return (
      <DynamicSky>
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ fontSize:15, fontWeight:700, color:"#fff", fontFamily:font }}>Loading…</div>
        </div>
      </DynamicSky>
    );
  }

  if (!hasSession) {
    return (
      <DynamicSky>
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ background:"#fff", borderRadius:20, padding:"28px 28px", maxWidth:380, width:"100%", textAlign:"center", boxShadow:"0 8px 28px rgba(0,0,0,.14)", fontFamily:font }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔗</div>
            <div style={{ fontSize:16, fontWeight:800, color:"#c0392b", marginBottom:8 }}>Link expired or invalid</div>
            <div style={{ fontSize:13, color:"#666", marginBottom:20, lineHeight:1.5 }}>
              The password reset link has expired or already been used. Please request a new one.
            </div>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              style={{ background:"linear-gradient(135deg,#5BBD4E,#27ae60)", color:"#fff", border:"none", borderRadius:12, padding:"11px 24px", fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:font }}
            >
              Request new link
            </button>
            <div style={{ marginTop:14 }}>
              <button type="button" onClick={() => navigate("/login")} style={{ background:"none", border:"none", color:"#aaa", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:font }}>
                ← Back to sign in
              </button>
            </div>
          </div>
        </div>
      </DynamicSky>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    if (password !== confirm) { toast.error("Passwords don't match."); return; }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) { toast.error(error.message); return; }
      setDone(true);
      // Sign out so they log in fresh with the new password
      await supabase.auth.signOut();
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return (
    <DynamicSky>
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ background:"#fff", borderRadius:24, overflow:"hidden", maxWidth:400, width:"100%", boxShadow:"0 12px 40px rgba(0,0,0,.16)" }}>
          <div style={{ background:"linear-gradient(135deg,#5BBD4E,#27ae60)", padding:"28px 28px 24px", textAlign:"center" }}>
            <div style={{ fontSize:44, marginBottom:8 }}>✅</div>
            <div style={{ fontSize:20, fontWeight:900, color:"#fff", fontFamily:font }}>Password updated!</div>
          </div>
          <div style={{ padding:"24px 28px 28px", textAlign:"center" }}>
            <p style={{ fontSize:14, fontWeight:600, color:"#3a5a3a", fontFamily:font, lineHeight:1.6, marginBottom:20 }}>
              Your password has been changed. Sign in with your new password.
            </p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{ background:"linear-gradient(135deg,#5BBD4E,#27ae60)", color:"#fff", border:"none", borderRadius:14, padding:"13px 32px", fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:font, boxShadow:"0 5px 0 0 rgba(22,163,74,.35)" }}
            >
              Sign in 🌱
            </button>
          </div>
        </div>
      </div>
    </DynamicSky>
  );

  return (
    <DynamicSky>
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 16px" }}>
        <div style={{ width:"100%", maxWidth:420, background:"#fff", borderRadius:24, boxShadow:"0 12px 40px rgba(0,0,0,.16)", overflow:"hidden" }}>

          <div style={{ background:"linear-gradient(135deg,#5BBD4E,#27ae60)", padding:"28px 28px 24px", textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:8 }}>🔑</div>
            <div style={{ fontSize:22, fontWeight:900, color:"#fff", fontFamily:font, textShadow:"0 2px 6px rgba(0,0,0,.2)" }}>
              Set new password
            </div>
            <div style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,.85)", marginTop:4, fontFamily:font }}>
              Choose a strong password for your account
            </div>
          </div>

          <div style={{ padding:"24px 28px 28px" }}>
            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>

              <div>
                <label style={{ fontSize:13, fontWeight:700, color:"#3a3a3a", fontFamily:font, display:"block", marginBottom:5 }}>
                  New password <span style={{ color:"#aaa", fontWeight:500 }}>(min 6 characters)</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  style={{ width:"100%", border:"2px solid #e0e0e0", borderRadius:12, padding:"11px 14px", fontSize:14, fontFamily:font, outline:"none", boxSizing:"border-box", transition:"border-color .15s" }}
                  onFocus={(e) => { e.target.style.borderColor="#5BBD4E"; }}
                  onBlur={(e)  => { e.target.style.borderColor="#e0e0e0"; }}
                />
              </div>

              <div>
                <label style={{ fontSize:13, fontWeight:700, color:"#3a3a3a", fontFamily:font, display:"block", marginBottom:5 }}>
                  Confirm new password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                  style={{ width:"100%", border:`2px solid ${confirm && confirm !== password ? "#e74c3c" : "#e0e0e0"}`, borderRadius:12, padding:"11px 14px", fontSize:14, fontFamily:font, outline:"none", boxSizing:"border-box", transition:"border-color .15s" }}
                  onFocus={(e) => { e.target.style.borderColor="#5BBD4E"; }}
                  onBlur={(e)  => { e.target.style.borderColor = (confirm && confirm !== password) ? "#e74c3c" : "#e0e0e0"; }}
                />
                {confirm && confirm !== password && (
                  <div style={{ fontSize:12, color:"#e74c3c", marginTop:3, fontFamily:font }}>Passwords don't match</div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{ background: submitting ? "#aaa" : "linear-gradient(135deg,#5BBD4E,#27ae60)", color:"#fff", border:"none", borderRadius:14, padding:"13px", fontSize:15, fontWeight:800, cursor: submitting ? "not-allowed" : "pointer", fontFamily:font, boxShadow:"0 5px 0 0 rgba(22,163,74,.35)", transition:"transform .15s", marginTop:4 }}
                onMouseEnter={(e) => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.transform="translateY(-2px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform=""; }}
              >
                {submitting ? "Saving…" : "Save new password 🔑"}
              </button>
            </form>
            <div style={{ marginTop:16, textAlign:"center" }}>
              <button type="button" onClick={() => navigate("/login")} style={{ background:"none", border:"none", color:"#aaa", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:font }}>
                ← Back to sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </DynamicSky>
  );
}

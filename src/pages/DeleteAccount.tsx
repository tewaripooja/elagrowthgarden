import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DynamicSky from "@/components/DynamicSky";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const font = "'Nunito',sans-serif";

export default function DeleteAccount() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirmed) return;
    setDeleting(true);
    try {
      const { error } = await supabase.rpc("delete_my_account");
      if (error) {
        toast.error("Could not delete account: " + error.message);
        return;
      }
      // Sign out locally
      await supabase.auth.signOut();
      toast.success("Your account and all data have been permanently deleted.");
      navigate("/signup");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DynamicSky>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <div style={{ width: "100%", maxWidth: 460, background: "#fff", borderRadius: 24, boxShadow: "0 12px 40px rgba(0,0,0,.14)", overflow: "hidden" }}>

          <div style={{ background: "linear-gradient(135deg,#e74c3c,#c0392b)", padding: "28px 28px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🗑️</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: font, margin: 0 }}>
              Delete Account & Data
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.85)", fontFamily: font, marginTop: 6, marginBottom: 0 }}>
              COPPA right to erasure
            </p>
          </div>

          <div style={{ padding: "28px 32px 32px" }}>
            {!session ? (
              <>
                <p style={{ fontSize: 14, color: "#555", fontFamily: font, lineHeight: 1.7, marginBottom: 20 }}>
                  You must be signed in to delete your account and all associated data.
                </p>
                <Link
                  to="/login"
                  style={{ display: "block", textAlign: "center", background: "linear-gradient(135deg,#5BBD4E,#27ae60)", color: "#fff", borderRadius: 14, padding: "13px", fontSize: 15, fontWeight: 800, textDecoration: "none", fontFamily: font }}
                >
                  Sign in first
                </Link>
              </>
            ) : (
              <>
                <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 12, padding: "14px 18px", marginBottom: 24, fontSize: 13, fontFamily: font, color: "#7f1d1d", lineHeight: 1.7 }}>
                  <strong>This action is permanent and cannot be undone.</strong><br />
                  Deleting your account will immediately erase:
                  <ul style={{ paddingLeft: 18, marginTop: 6, marginBottom: 0 }}>
                    <li>Your login and profile information</li>
                    <li>Your child's name and grade level</li>
                    <li>All reading progress and activity scores</li>
                    <li>All story sessions and game data</li>
                  </ul>
                  <p style={{ marginTop: 8, marginBottom: 0 }}>
                    A consent record is retained for 365 days for legal compliance, then permanently deleted.
                  </p>
                </div>

                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 24 }}>
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={e => setConfirmed(e.target.checked)}
                    style={{ marginTop: 3, accentColor: "#e74c3c", width: 16, height: 16, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 13, color: "#3a3a3a", fontFamily: font, lineHeight: 1.6 }}>
                    I understand that this will permanently delete my account and all of my child's data,
                    and that this cannot be reversed.
                  </span>
                </label>

                <button
                  onClick={handleDelete}
                  disabled={!confirmed || deleting}
                  style={{
                    width: "100%", background: confirmed ? "linear-gradient(135deg,#e74c3c,#c0392b)" : "#ccc",
                    color: "#fff", border: "none", borderRadius: 14, padding: "13px",
                    fontSize: 15, fontWeight: 800, cursor: confirmed && !deleting ? "pointer" : "not-allowed",
                    fontFamily: font, marginBottom: 12,
                  }}
                >
                  {deleting ? "Deleting…" : "Permanently Delete My Account"}
                </button>

                <div style={{ textAlign: "center" }}>
                  <Link to="/" style={{ fontSize: 13, color: "#888", fontFamily: font, textDecoration: "none" }}>
                    ← Cancel, go back to Garden
                  </Link>
                </div>
              </>
            )}

            <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid #eee", fontSize: 12, color: "#aaa", fontFamily: font, textAlign: "center", lineHeight: 1.6 }}>
              Questions? Email us at{" "}
              <a href="mailto:pooja1tewari@gmail.com" style={{ color: "#27ae60" }}>
                pooja1tewari@gmail.com
              </a>
              <br />
              <Link to="/privacy-policy" style={{ color: "#27ae60" }}>Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </DynamicSky>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGameState } from "@/hooks/useGameState";
import DynamicSky from "@/components/DynamicSky";
import { supabase } from "@/integrations/supabase/client";
import {
  getGradeLevel,
  setGradeLevel,
  GRADE_META,
  type GradeLevel,
} from "@/lib/gradeLevel";

const font = "'Nunito',sans-serif";

function Avatar({ url, name }: { url?: string; name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        style={{
          width: 80, height: 80, borderRadius: "50%",
          border: "3px solid rgba(255,255,255,.9)",
          boxShadow: "0 4px 16px rgba(0,0,0,.18)",
          objectFit: "cover",
        }}
      />
    );
  }
  return (
    <div style={{
      width: 80, height: 80, borderRadius: "50%",
      background: "linear-gradient(135deg,#5BBD4E,#27ae60)",
      border: "3px solid rgba(255,255,255,.9)",
      boxShadow: "0 4px 16px rgba(0,0,0,.18)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 28, fontWeight: 900, color: "#fff", fontFamily: font,
    }}>
      {initials || "?"}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div style={{
      background: "#f8fdf8", borderRadius: 16, padding: "14px 16px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
      border: "1.5px solid #e8f5e9", flex: 1,
    }}>
      <div style={{ fontSize: 24 }}>{icon}</div>
      <div style={{ fontSize: 20, fontWeight: 900, color: "#2a5a2a", fontFamily: font }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#7a9a7a", fontFamily: font }}>{label}</div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const gameState = useGameState();
  const user = session?.user;

  const displayName: string =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Learner";

  const avatarUrl: string | undefined = user?.user_metadata?.avatar_url;
  const email = user?.email ?? "";
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  const [currentGrade, setCurrentGrade] = useState<GradeLevel | null>(getGradeLevel);
  const [changingGrade, setChangingGrade] = useState(false);
  const [savingGrade, setSavingGrade] = useState(false);

  const handleGradeChange = async (grade: GradeLevel) => {
    setSavingGrade(true);
    setGradeLevel(grade);
    if (user) await supabase.auth.updateUser({ data: { grade_level: grade } });
    setCurrentGrade(grade);
    setChangingGrade(false);
    setSavingGrade(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <DynamicSky>
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", padding: "16px 16px 40px",
      }}>

        {/* Card */}
        <div style={{
          width: "100%", maxWidth: 480,
          background: "#fff", borderRadius: 24,
          boxShadow: "0 12px 40px rgba(0,0,0,.16)",
          overflow: "hidden",
        }}>

          {/* Profile header */}
          <div style={{
            background: "linear-gradient(135deg,#5BBD4E,#27ae60)",
            padding: "16px 20px 24px",
          }}>
            {/* Back button row */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => navigate("/")}
                style={{
                  background: "rgba(255,255,255,.25)", border: "1.5px solid rgba(255,255,255,.6)",
                  borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 13,
                  padding: "6px 14px", cursor: "pointer", fontFamily: font,
                  display: "flex", alignItems: "center", gap: 5,
                }}
              >
                ← Home
              </button>
              <div style={{ flex: 1, textAlign: "center", fontSize: 15, fontWeight: 900, color: "#fff", fontFamily: font, textShadow: "0 1px 6px rgba(0,0,0,.2)" }}>
                My Profile
              </div>
              <div style={{ width: 70 }} />
            </div>
            {/* Avatar + name centred */}
            <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <Avatar url={avatarUrl} name={displayName} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: font, textShadow: "0 1px 6px rgba(0,0,0,.2)" }}>
              {displayName}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.85)", fontFamily: font, marginTop: 4 }}>
              {email}
            </div>
            {joinedDate && (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", fontFamily: font, marginTop: 4 }}>
                Member since {joinedDate}
              </div>
            )}
            </div> {/* end textAlign:center */}
          </div>

          {/* Body */}
          <div style={{ padding: "24px 24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 10 }}>
              <StatCard icon="⭐" label="Stars" value={gameState.stars} />
              <StatCard icon="🔥" label="Streak" value={gameState.perfectStreak || 0} />
              <StatCard icon="📚" label="Level" value={gameState.level} />
            </div>

            {/* Grade section */}
            <div style={{ background: "#f8fdf8", borderRadius: 18, padding: "18px 20px", border: "1.5px solid #e8f5e9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#2a5a2a", fontFamily: font }}>
                  Reading Grade
                </div>
                {!changingGrade && (
                  <button
                    type="button"
                    onClick={() => setChangingGrade(true)}
                    style={{
                      background: "linear-gradient(135deg,#5BBD4E,#27ae60)",
                      border: "none", borderRadius: 10, color: "#fff",
                      fontSize: 12, fontWeight: 700, padding: "5px 14px",
                      cursor: "pointer", fontFamily: font,
                    }}
                  >
                    Change
                  </button>
                )}
              </div>

              {!changingGrade && currentGrade && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: GRADE_META[currentGrade].color,
                  borderRadius: 14, padding: "12px 16px",
                  border: "2px solid rgba(255,255,255,.8)",
                }}>
                  <div style={{ fontSize: 28 }}>{GRADE_META[currentGrade].emoji}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#2a3a2a", fontFamily: font }}>
                      {GRADE_META[currentGrade].label}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#4a6a4a", fontFamily: font }}>
                      {GRADE_META[currentGrade].tagline}
                    </div>
                  </div>
                </div>
              )}

              {changingGrade && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {([1, 2, 3, 4, 5] as GradeLevel[]).map((g) => {
                    const m = GRADE_META[g];
                    return (
                      <button
                        key={g}
                        type="button"
                        disabled={savingGrade}
                        onClick={() => void handleGradeChange(g)}
                        style={{
                          background: currentGrade === g ? m.color : "#fff",
                          border: `2px solid ${currentGrade === g ? "rgba(255,255,255,.7)" : "#e0e0e0"}`,
                          borderRadius: 14, padding: "10px 14px",
                          display: "flex", alignItems: "center", gap: 10,
                          cursor: savingGrade ? "wait" : "pointer",
                          fontFamily: font, width: "100%", textAlign: "left",
                          boxShadow: currentGrade === g ? `0 3px 0 0 ${m.shadow}` : "none",
                          opacity: savingGrade ? 0.7 : 1,
                        }}
                      >
                        <span style={{ fontSize: 22 }}>{m.emoji}</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 900, color: "#2a3a2a" }}>{m.label}</div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#4a6a4a" }}>{m.tagline}</div>
                        </div>
                        {currentGrade === g && <span style={{ marginLeft: "auto", fontSize: 16 }}>✓</span>}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setChangingGrade(false)}
                    style={{
                      background: "none", border: "1.5px solid #ddd", borderRadius: 10,
                      color: "#999", fontSize: 13, fontWeight: 700,
                      padding: "8px", cursor: "pointer", fontFamily: font, marginTop: 2,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Account section */}
            <div style={{ background: "#f8fdf8", borderRadius: 18, padding: "18px 20px", border: "1.5px solid #e8f5e9" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#2a5a2a", fontFamily: font, marginBottom: 12 }}>
                Account
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #eee" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#555", fontFamily: font }}>Name</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#333", fontFamily: font }}>{displayName}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#555", fontFamily: font }}>Email</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#333", fontFamily: font, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</span>
                </div>
              </div>
            </div>

            {/* Sign out */}
            <button
              type="button"
              onClick={() => void handleSignOut()}
              style={{
                background: "#fff", border: "2px solid #ffb3b3", borderRadius: 14,
                color: "#e74c3c", fontSize: 14, fontWeight: 800,
                padding: "13px", cursor: "pointer", fontFamily: font,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background .15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#fff5f5"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}
            >
              🚪 Sign out
            </button>

          </div>
        </div>
      </div>
    </DynamicSky>
  );
}

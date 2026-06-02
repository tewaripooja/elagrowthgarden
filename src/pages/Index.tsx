import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { getGradeLevel, GRADE_META } from "@/lib/gradeLevel";
import DynamicSky from "@/components/DynamicSky";
import { useAuth } from "@/contexts/AuthContext";
import { useGameState } from "@/hooks/useGameState";
import type { ActivityType } from "@/lib/ai";

const ACTIVITY_TAB_BY_LABEL: Record<string, ActivityType> = {
  Reading: "vocabulary",
  Vocabulary: "vocabulary",
  "Fact vs Opinion": "fact-opinion",
  Summaries: "summaries",
  "Character Traits": "character-traits",
  "Compare & Contrast": "compare-contrast",
};

const ACTIVITY_CARDS = [
  { label: "Reading",           icon: "📖", gradient: "linear-gradient(135deg,#FFD580,#FFB347)", shadow: "rgba(255,150,50,.35)", fromReading: true  },
  { label: "Vocabulary",        icon: "🔤", gradient: "linear-gradient(135deg,#E8B4F8,#C084FC)", shadow: "rgba(192,100,255,.30)", fromReading: false },
  { label: "Fact vs Opinion",   icon: "✅", gradient: "linear-gradient(135deg,#B8D8F8,#7EC8F8)", shadow: "rgba(60,160,240,.28)",  fromReading: false },
  { label: "Summaries",         icon: "📝", gradient: "linear-gradient(135deg,#F8F0A0,#F0D040)", shadow: "rgba(220,180,0,.30)",   fromReading: false },
  { label: "Character Traits",  icon: "🎭", gradient: "linear-gradient(135deg,#A8F0C0,#5BBD4E)", shadow: "rgba(60,180,80,.28)",   fromReading: false },
  { label: "Compare & Contrast",icon: "🔀", gradient: "linear-gradient(135deg,#A0E8F8,#40C8E8)", shadow: "rgba(30,180,220,.28)",  fromReading: false },
] as const;

const PIP_MESSAGES = [
  "Hi! I'm Pip 🌟 Pick an activity!",
  "Your garden is growing! 🌱",
  "Read a story to earn stars! ⭐",
  "Every answer makes you smarter! 💪",
  "You're doing amazing! 🎉",
  "Keep going — you've got this! 🌸",
];

function GardenPlants() {
  const plants = [
    { head: <div style={{ width:38,height:38,background:"#FFD700",borderRadius:"50%",border:"4px solid #FFA500",position:"relative" as const,animation:"grass-sway 4s ease-in-out infinite" }}><div style={{ position:"absolute" as const,top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:14,height:14,background:"#8B4513",borderRadius:"50%" }} /></div>, stemH: 52 },
    { head: <div style={{ width:26,height:34,background:"#FF6B8A",borderRadius:"50% 50% 30% 30%",animation:"grass-sway 5s ease-in-out infinite .5s" }} />, stemH: 46 },
    { head: <div style={{ width:28,height:28,background:"#fff",borderRadius:"50%",border:"3px solid #ddd",position:"relative" as const,animation:"grass-sway 3.5s ease-in-out infinite 1s" }}><div style={{ position:"absolute" as const,top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:11,height:11,background:"#FFD700",borderRadius:"50%" }} /></div>, stemH: 42 },
    { head: <div style={{ width:20,height:20,background:"#7bc857",borderRadius:"50% 50% 50% 0",transform:"rotate(-30deg)",animation:"grass-sway 4.5s ease-in-out infinite .8s" }} />, stemH: 30 },
    { head: <div style={{ fontSize:15,marginBottom:2 }}>🌰</div>, stemH: 0, mound: true },
  ];
  return (
    <div style={{ position:"absolute",bottom:0,left:0,right:0,display:"flex",alignItems:"flex-end",justifyContent:"center",gap:24,paddingBottom:10,paddingLeft:8,paddingRight:8,pointerEvents:"none" }}>
      {plants.map((p, i) => (
        <div key={i} style={{ display:"flex",flexDirection:"column",alignItems:"center" }}>
          {p.head}
          {p.stemH > 0 && <div style={{ width:6,height:p.stemH,background:"#4a9e2e",borderRadius:3 }} />}
          {p.mound && <div style={{ width:28,height:15,background:"#a07850",borderRadius:"50%" }} />}
        </div>
      ))}
    </div>
  );
}

function PipMascot({ onClick }: { onClick: () => void }) {
  return (
    <svg className="animate-pip-float cursor-pointer select-none" width="68" height="68" viewBox="0 0 64 64" onClick={onClick} aria-label="Pip mascot">
      <circle cx="32" cy="22" r="16" fill="#A8E6CF" />
      <ellipse cx="32" cy="38" rx="18" ry="15" fill="#A8E6CF" />
      <ellipse cx="32" cy="8" rx="13" ry="5" fill="#8B5E3C" />
      <rect x="23" y="5" width="18" height="6" rx="3" fill="#A0522D" />
      <ellipse cx="14" cy="30" rx="10" ry="6" fill="#5BBD4E" opacity=".85" transform="rotate(-25 14 30)" />
      <ellipse cx="50" cy="30" rx="10" ry="6" fill="#5BBD4E" opacity=".85" transform="rotate(25 50 30)" />
      <circle cx="26" cy="21" r="4" fill="white" /><circle cx="38" cy="21" r="4" fill="white" />
      <circle cx="27" cy="22" r="2.2" fill="#2a3a1a" /><circle cx="39" cy="22" r="2.2" fill="#2a3a1a" />
      <circle cx="27.7" cy="21.2" r=".9" fill="white" /><circle cx="39.7" cy="21.2" r=".9" fill="white" />
      <path d="M27 28 Q32 33 37 28" fill="none" stroke="#2a3a1a" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="32" cy="38" r="5" fill="#FFE066" opacity=".65" />
    </svg>
  );
}

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const gameState = useGameState();
  const [pipMsg, setPipMsg] = useState(0);
  const [pipKey, setPipKey] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPipMsg((m) => (m + 1) % PIP_MESSAGES.length);
      setPipKey((k) => k + 1);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const handlePipClick = () => {
    setPipMsg((m) => (m + 1) % PIP_MESSAGES.length);
    setPipKey((k) => k + 1);
  };

  const stageSteps = 5;
  const progressPct = Math.min(100, Math.round((gameState.stageIndex / stageSteps) * 100));

  return (
    <DynamicSky>
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column" }}>

        {/* ── TOP NAV BAR ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 18px", zIndex:20, position:"relative" }}>
          <div style={{ fontSize:26, fontWeight:900, color:"#fff", textShadow:"0 2px 10px rgba(0,0,0,.30)", fontFamily:"'Nunito',sans-serif", display:"flex", alignItems:"center", gap:8 }}>
            🌱 ELA Growth Garden
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {/* Stats pills */}
            <div style={{ background:"rgba(255,255,255,.88)", borderRadius:20, padding:"5px 13px", fontSize:13, fontWeight:800, color:"#3a5a2a", display:"flex", alignItems:"center", gap:5 }}>
              🔥 {gameState.perfectStreak || 0}
            </div>
            <div style={{ background:"rgba(255,255,255,.88)", borderRadius:20, padding:"5px 13px", fontSize:13, fontWeight:800, color:"#3a5a2a", display:"flex", alignItems:"center", gap:5 }}>
              ⭐ {gameState.stars}
            </div>
            {/* Grade pill */}
            {(() => {
              const grade = getGradeLevel();
              if (!grade) return null;
              const meta = GRADE_META[grade];
              return (
                <div style={{ background:"rgba(255,255,255,.88)", borderRadius:20, padding:"5px 13px", fontSize:13, fontWeight:800, color:"#3a5a2a", display:"flex", alignItems:"center", gap:4 }}>
                  {meta.emoji} {meta.label}
                </div>
              );
            })()}
            {/* Profile avatar button */}
            <button
              type="button"
              onClick={() => navigate("/profile")}
              title="My Profile"
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg,#5BBD4E,#27ae60)",
                border: "2px solid rgba(255,255,255,.85)",
                cursor: "pointer", overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,.18)",
                padding: 0, flexShrink: 0,
              }}
            >
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url as string} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: 16, color: "#fff", fontWeight: 900, fontFamily:"'Nunito',sans-serif", lineHeight: 1 }}>
                  {((user?.user_metadata?.full_name || user?.email || "?") as string)[0].toUpperCase()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── GARDEN SCENE ── */}
        <div style={{ position:"relative", height:190, flexShrink:0, overflow:"hidden" }}>
          {/* Pip + bubble — horizontal row anchored just above the ground */}
          <div style={{ position:"absolute", bottom:84, right:14, zIndex:10, display:"flex", flexDirection:"row", alignItems:"flex-end", gap:8 }}>
            {/* Bubble tail points right toward Pip */}
            <div
              key={pipKey}
              className="animate-pip-bubble-pop"
              style={{
                background:"rgba(255,255,255,.96)",
                border:"2px solid #c8e8a0",
                borderRadius:"14px 14px 14px 4px",
                padding:"9px 14px",
                fontFamily:"'Nunito',sans-serif",
                fontSize:13,
                fontWeight:700,
                color:"#2a4a1a",
                lineHeight:1.45,
                maxWidth:180,
                boxShadow:"0 3px 10px rgba(0,0,0,.12)",
              }}
            >
              {PIP_MESSAGES[pipMsg]}
            </div>
            <PipMascot onClick={handlePipClick} />
          </div>

          {/* Ground strip */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:78, background:"#8B5E3C", borderRadius:"40px 40px 0 0" }}>
            <div style={{ position:"absolute", top:-16, left:0, right:0, height:32, background:"#5BBD4E", borderRadius:"50px 50px 0 0" }} />
            <GardenPlants />
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ background:"#f0fae8", flex:1, display:"flex", flexDirection:"column" }}>
          {/* Centered content wrapper */}
          <div style={{ width:"100%", maxWidth:700, margin:"0 auto", padding:"20px 18px 28px", display:"flex", flexDirection:"column", gap:20 }}>

            {/* Section title */}
            <div style={{ fontSize:16, fontWeight:800, color:"#3a5a2a", fontFamily:"'Nunito',sans-serif" }}>
              Choose an Activity
            </div>

            {/* Activity cards — 3 columns, 2 rows */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12 }}>
              {ACTIVITY_CARDS.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={() => navigate("/activity", { state: { activityTab: ACTIVITY_TAB_BY_LABEL[a.label] ?? "vocabulary", fromReading: a.fromReading } })}
                  style={{
                    background: a.gradient,
                    borderRadius: 20,
                    padding: "18px 10px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    border: "2.5px solid rgba(255,255,255,.85)",
                    boxShadow: `0 6px 0 0 ${a.shadow}`,
                    cursor: "pointer",
                    transition: "transform .15s, box-shadow .15s",
                    minHeight: 130,
                    fontFamily: "'Nunito',sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-4px) scale(1.03)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 10px 0 0 ${a.shadow}`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 0 0 ${a.shadow}`;
                  }}
                >
                  {/* Big icon */}
                  <div style={{ fontSize: 38, lineHeight: 1, filter:"drop-shadow(0 2px 4px rgba(0,0,0,.15))" }}>
                    {a.icon}
                  </div>
                  {/* Label */}
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#2a2060", textAlign: "center", lineHeight: 1.25 }}>
                    {a.label}
                  </div>
                </button>
              ))}
            </div>

            {/* Garden progress */}
            <div style={{ background:"#fff", borderRadius:16, padding:"14px 18px", boxShadow:"0 2px 8px rgba(0,0,0,.06)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div style={{ fontSize:13, fontWeight:800, color:"#5a7a4a", fontFamily:"'Nunito',sans-serif" }}>
                  🌻 Garden Progress — <span style={{ textTransform:"capitalize" }}>{gameState.currentStage}</span>
                </div>
                <div style={{ fontSize:12, fontWeight:700, color:"#7a9a6a" }}>
                  {gameState.flowers} 🌸
                </div>
              </div>
              <div style={{ background:"#e0f0cc", borderRadius:10, height:13, overflow:"hidden" }}>
                <div style={{ height:"100%", background:"linear-gradient(90deg,#5BBD4E,#27ae60)", borderRadius:10, transition:"width .6s ease", width:`${progressPct}%` }} />
              </div>
              <div style={{ fontSize:12, color:"#7a9a6a", marginTop:6, fontWeight:600, fontFamily:"'Nunito',sans-serif" }}>
                {5 - gameState.stageIndex} more perfect activities to reach the next stage!
              </div>
            </div>

            {/* My Progress button */}
            <div style={{ display:"flex", justifyContent:"center" }}>
              <button
                type="button"
                onClick={() => navigate("/progress")}
                style={{
                  background: "linear-gradient(135deg,#5BBD4E,#27ae60)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 18,
                  padding: "15px 40px",
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  boxShadow: "0 7px 0 0 rgba(22,163,74,.4)",
                  transition: "transform .15s",
                  fontFamily: "'Nunito',sans-serif",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
              >
                <Trophy size={22} /> My Progress 🏆
              </button>
            </div>

          </div>
        </div>

      </div>
    </DynamicSky>
  );
}

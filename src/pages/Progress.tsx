import { useNavigate } from "react-router-dom";
import DynamicSky from "@/components/DynamicSky";
import { ArrowLeft } from "lucide-react";
import Garden from "@/components/Garden";
import { useGameState, LEVEL_TO_STAGE } from "@/hooks/useGameState";
import { XP_THRESHOLDS, LEVEL_TITLES } from "@/data/frostbiteGameData";

// ─── Mini components ──────────────────────────────────────────────────────────

function PipFace() {
  return (
    <svg width="38" height="38" viewBox="0 0 64 64" className="animate-pip-float shrink-0" aria-hidden>
      <circle cx="32" cy="22" r="16" fill="#A8E6CF"/>
      <ellipse cx="32" cy="38" rx="18" ry="15" fill="#A8E6CF"/>
      <ellipse cx="32" cy="8" rx="13" ry="5" fill="#8B5E3C"/>
      <rect x="23" y="5" width="18" height="6" rx="3" fill="#A0522D"/>
      <ellipse cx="14" cy="30" rx="10" ry="6" fill="#5BBD4E" opacity=".85" transform="rotate(-25 14 30)"/>
      <ellipse cx="50" cy="30" rx="10" ry="6" fill="#5BBD4E" opacity=".85" transform="rotate(25 50 30)"/>
      <circle cx="26" cy="21" r="4" fill="white"/><circle cx="38" cy="21" r="4" fill="white"/>
      <circle cx="27" cy="22" r="2.2" fill="#2a3a1a"/><circle cx="39" cy="22" r="2.2" fill="#2a3a1a"/>
      <path d="M27 28 Q32 33 37 28" fill="none" stroke="#2a3a1a" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function Badge({ emoji, label, earned }: { emoji: string; label: string; earned: boolean }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4,
      opacity: earned ? 1 : 0.28, filter: earned ? "none" : "grayscale(1)" }}>
      <div style={{
        width:44, height:44, borderRadius:"50%",
        background: earned ? "linear-gradient(135deg,#FFD580,#FFB347)" : "#e0e0e0",
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
        boxShadow: earned ? "0 3px 0 0 rgba(255,150,50,.4)" : "none",
        border: earned ? "2px solid rgba(255,255,255,.8)" : "2px solid #ccc",
      }}>{emoji}</div>
      <div style={{ fontSize:10, fontWeight:700, color: earned ? "#3a5a2a" : "#aaa",
        textAlign:"center", maxWidth:62, lineHeight:1.3, fontFamily:"'Nunito',sans-serif" }}>
        {label}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Progress() {
  const navigate = useNavigate();
  const { gameState: gs, xpProgress } = useGameState();

  const level      = gs?.level ?? 1;
  const xp         = gs?.xp ?? 0;
  const streak     = gs?.streak ?? 0;
  const bosses     = gs?.bossEncountersWon ?? 0;
  const title      = gs?.title ?? LEVEL_TITLES[1];
  const stage      = LEVEL_TO_STAGE[level];
  const frostMeter = gs?.frostbiteDefeatMeter ?? 0;
  const bloomedPlants = gs?.plants.filter(p => p.bloomed).length ?? 0;

  const nextLevelXP  = XP_THRESHOLDS[level + 1] ?? XP_THRESHOLDS[5];
  const thisLevelXP  = XP_THRESHOLDS[level] ?? 0;
  const xpInLevel    = xp - thisLevelXP;
  const xpNeeded     = nextLevelXP - thisLevelXP;

  const pipMsg =
    bosses >= 5   ? "Frostbite fears you now! ❄️🏆" :
    level >= 4    ? "You're almost a Grand Cultivator! 🌟" :
    streak >= 7   ? `${streak}-day streak! You're on fire! 🔥` :
    bosses >= 1   ? "You've beaten Frostbite! Keep going! 💪" :
                    "Read stories to level up your garden! 🌱";

  const achievements = [
    { emoji:"🌱", label:"First Session",    earned: (gs?.lastPlayedDate ?? '') !== '' },
    { emoji:"⭐", label:"50 XP",            earned: xp >= 50 },
    { emoji:"🔥", label:"3-Day Streak",     earned: streak >= 3 },
    { emoji:"🧊", label:"Beat Frostbite",   earned: bosses >= 1 },
    { emoji:"🌸", label:"3 Plants",         earned: bloomedPlants >= 3 },
    { emoji:"📚", label:"Level 3",          earned: level >= 3 },
    { emoji:"🔥", label:"7-Day Streak",     earned: streak >= 7 },
    { emoji:"🏆", label:"Level 5",          earned: level >= 5 },
  ];

  const font = "'Nunito',sans-serif";
  const card: React.CSSProperties = {
    background:"#fff", borderRadius:18, padding:"14px 16px",
    boxShadow:"0 2px 10px rgba(0,0,0,.07)",
  };

  return (
    <DynamicSky>
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column" }}>

        {/* HEADER */}
        <div style={{ background:"linear-gradient(135deg,#5BBD4E,#27ae60)", padding:"12px 16px 14px", display:"flex", alignItems:"center", gap:12 }}>
          <button type="button" onClick={() => navigate("/")}
            style={{ background:"rgba(255,255,255,.25)", border:"none", borderRadius:12, color:"#fff", fontWeight:800, fontSize:13, padding:"7px 14px", cursor:"pointer", fontFamily:font, display:"flex", alignItems:"center", gap:6 }}>
            <ArrowLeft size={15}/> Garden
          </button>
          <h1 style={{ fontSize:20, fontWeight:900, color:"#fff", fontFamily:font, textShadow:"0 2px 6px rgba(0,0,0,.2)", flex:1 }}>
            My Progress 🏆
          </h1>
          <button type="button" onClick={() => navigate("/activity", { state:{ fromReading:true } })}
            style={{ background:"rgba(255,255,255,.25)", border:"none", borderRadius:12, color:"#fff", fontWeight:800, fontSize:12, padding:"7px 14px", cursor:"pointer", fontFamily:font }}>
            Read 📖
          </button>
        </div>

        {/* MAIN */}
        <div style={{ background:"#f0fae8", flex:1, padding:"14px 14px 24px" }}>
          <div style={{ maxWidth:680, margin:"0 auto", display:"flex", flexDirection:"column", gap:12 }}>

            {/* ── SECTION 1: Stats + Pip ── */}
            <div style={{ ...card, display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, flex:1 }}>
                {[
                  { e:"⭐", v: xp,      l:"Total XP",  bg:"#fffde7", b:"#FFD700" },
                  { e:"📚", v: title,   l:"Title",     bg:"#e8f5e9", b:"#4caf50" },
                  { e:"🔥", v: streak,  l:"Streak",    bg:"#fff3e0", b:"#ff9800" },
                  { e:"🧊", v: bosses,  l:"Bosses Won",bg:"#e3f2fd", b:"#2196f3" },
                ].map(({ e, v, l, bg, b }) => (
                  <div key={l} style={{ background:bg, border:`2px solid ${b}`, borderRadius:14, padding:"9px 10px", display:"flex", alignItems:"center", gap:8, boxShadow:`0 3px 0 0 ${b}55` }}>
                    <span style={{ fontSize:20 }}>{e}</span>
                    <div>
                      <div style={{ fontSize: typeof v === 'string' ? 10 : 18, fontWeight:900, color:"#2a3a2a", fontFamily:font, lineHeight:1 }}>{v}</div>
                      <div style={{ fontSize:10, fontWeight:700, color:"#6a8a6a", fontFamily:font }}>{l}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, minWidth:90, maxWidth:110 }}>
                <PipFace/>
                <div style={{ fontSize:11, fontWeight:700, color:"#3a5a3a", fontFamily:font, textAlign:"center", lineHeight:1.35 }}>
                  {pipMsg}
                </div>
              </div>
            </div>

            {/* ── SECTION 2: XP Level Progress ── */}
            <div style={card}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:14, fontWeight:800, color:"#3a5a2a", fontFamily:font }}>
                  Level {level} — {title}
                </span>
                <span style={{ fontSize:12, fontWeight:700, color:"#7a9a6a", fontFamily:font }}>
                  {level < 5 ? `${xpInLevel} / ${xpNeeded} XP` : "MAX LEVEL"}
                </span>
              </div>
              <div style={{ background:"#e0f0cc", borderRadius:10, height:13, overflow:"hidden" }}>
                <div style={{ height:"100%", background:"linear-gradient(90deg,#5BBD4E,#27ae60)", borderRadius:10, transition:"width .6s ease", width:`${xpProgress}%` }}/>
              </div>
              {/* Frostbite defeat meter */}
              <div style={{ marginTop:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:"#4a90a0", fontFamily:font }}>❄️ Frostbite Defeat Meter</span>
                  <span style={{ fontSize:12, fontWeight:700, color:"#4a90a0", fontFamily:font }}>{frostMeter}%</span>
                </div>
                <div style={{ background:"#d0e8f0", borderRadius:10, height:10, overflow:"hidden" }}>
                  <div style={{ height:"100%", background:"linear-gradient(90deg,#7EC8E3,#27ae60)", borderRadius:10, transition:"width .6s ease", width:`${frostMeter}%` }}/>
                </div>
              </div>
            </div>

            {/* ── SECTION 3: Garden + Achievements ── */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>

              {/* Garden */}
              <div style={{ ...card, display:"flex", flexDirection:"column", gap:8 }}>
                <div style={{ fontSize:14, fontWeight:800, color:"#3a5a2a", fontFamily:font }}>My Garden 🌱</div>
                <div style={{ fontSize:11, fontWeight:600, color:"#7a9a6a", fontFamily:font }}>
                  {title} · {bloomedPlants} 🌸
                </div>
                <div style={{ background:"#e0f0cc", borderRadius:8, height:8, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${xpProgress}%`, background:"linear-gradient(90deg,#5BBD4E,#27ae60)", borderRadius:8, transition:"width .8s ease" }}/>
                </div>
                <div style={{ transform:"scale(0.85)", transformOrigin:"top center", marginTop:-8 }}>
                  <Garden currentStage={stage} flowers={bloomedPlants}/>
                </div>
                <div style={{ fontSize:11, fontWeight:600, color:"#5a7a5a", fontFamily:font, textAlign:"center", marginTop:-4 }}>
                  {level === 5 ? "Full bloom! 🌸" : `${xpNeeded - xpInLevel} XP to next stage`}
                </div>
              </div>

              {/* Achievements */}
              <div style={{ ...card }}>
                <div style={{ fontSize:14, fontWeight:800, color:"#3a5a2a", fontFamily:font, marginBottom:10 }}>
                  Achievements 🏅
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {achievements.map((a) => (
                    <Badge key={a.label} emoji={a.emoji} label={a.label} earned={a.earned}/>
                  ))}
                </div>
                <div style={{ marginTop:10, textAlign:"center", fontSize:11, fontWeight:600, color:"#aaa", fontFamily:font }}>
                  {achievements.filter((a) => a.earned).length}/{achievements.length} unlocked
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </DynamicSky>
  );
}

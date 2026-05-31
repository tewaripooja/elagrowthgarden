import { useNavigate } from "react-router-dom";
import DynamicSky from "@/components/DynamicSky";
import { ArrowLeft } from "lucide-react";
import Garden from "@/components/Garden";
import { useGameState, type StoryRecord } from "@/hooks/useGameState";

// ─── Data helpers ─────────────────────────────────────────────────────────────

const ALL_ACTIVITIES = [
  "vocabulary", "fact-opinion", "summaries", "character-traits", "compare-contrast",
] as const;
type ActivityId = typeof ALL_ACTIVITIES[number];

const ACTIVITY_META: Record<ActivityId, { label: string; emoji: string; bar: string }> = {
  vocabulary:         { label: "Vocabulary",         emoji: "📚", bar: "#F0A800" },
  "fact-opinion":     { label: "Fact vs Opinion",    emoji: "✅", bar: "#3498DB" },
  summaries:          { label: "Summaries",           emoji: "📝", bar: "#C8A000" },
  "character-traits": { label: "Character Traits",   emoji: "🎭", bar: "#27ae60" },
  "compare-contrast": { label: "Compare & Contrast", emoji: "🔀", bar: "#00BCD4" },
};

function groupByStory(history: StoryRecord[]) {
  const m = new Map<string, StoryRecord[]>();
  history.forEach((r) => { const list = m.get(r.storyKey) ?? []; list.push(r); m.set(r.storyKey, list); });
  return m;
}

function completeStoryKeys(history: StoryRecord[]): Set<string> {
  const groups = groupByStory(history);
  const complete = new Set<string>();
  groups.forEach((records, key) => {
    if (ALL_ACTIVITIES.every((a) => records.some((r) => r.activityType === a && r.perfect)))
      complete.add(key);
  });
  return complete;
}

function activityPct(history: StoryRecord[], actType: string, completeKeys: Set<string>): number {
  const rows = history.filter((r) => completeKeys.has(r.storyKey) && r.activityType === actType);
  if (!rows.length) return 0;
  const c = rows.reduce((s, r) => s + r.correctAnswers, 0);
  const t = rows.reduce((s, r) => s + r.totalQuestions, 0);
  return t > 0 ? Math.round((c / t) * 100) : 0;
}

// ─── Mini components ──────────────────────────────────────────────────────────

function StarRating({ pct }: { pct: number }) {
  const n = pct >= 95 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
  return (
    <span style={{ fontSize: 11, letterSpacing: 1 }}>
      {[1,2,3].map((i) => <span key={i} style={{ opacity: i <= n ? 1 : 0.2 }}>⭐</span>)}
    </span>
  );
}

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
  const gs = useGameState();

  const completeKeys = completeStoryKeys(gs.storyHistory);
  const totalStories = completeKeys.size;
  const scores = Object.fromEntries(ALL_ACTIVITIES.map((a) => [a, activityPct(gs.storyHistory, a, completeKeys)]));
  const avgScore = Math.round(ALL_ACTIVITIES.reduce((s, a) => s + scores[a], 0) / ALL_ACTIVITIES.length);

  const pipMsg =
    gs.stars >= 10   ? "You're a superstar! Amazing! 🌟" :
    gs.stars >= 5    ? "Look at all those stars! 🌟" :
    totalStories >= 3 ? "So many stories — I'm proud! 📖" :
    gs.flowers > 0   ? "Your garden is blooming! 🌸" :
                       "Read a story to start your garden! 🌱";

  const achievements = [
    { emoji:"🌱", label:"First Story",  earned: gs.storyHistory.length > 0 },
    { emoji:"⭐", label:"First Star",   earned: gs.stars >= 1 },
    { emoji:"🌸", label:"1st Flower",   earned: gs.flowers >= 1 },
    { emoji:"📚", label:"5 Stories",    earned: totalStories >= 5 },
    { emoji:"🔥", label:"3-Day Streak", earned: (gs.perfectStreak || 0) >= 3 },
    { emoji:"🏆", label:"10 Stars",     earned: gs.stars >= 10 },
    { emoji:"🌳", label:"Full Tree",    earned: gs.flowers >= 20 },
    { emoji:"💎", label:"All Perfect",  earned: avgScore === 100 && totalStories > 0 },
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

            {/* ── SECTION 1: Stats + Pip merged ── */}
            <div style={{ ...card, display:"flex", alignItems:"center", gap:12 }}>
              {/* Stat pills in a compact 2×2 grid */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, flex:1 }}>
                {[
                  { e:"⭐", v:gs.stars,              l:"Stars",   bg:"#fffde7", b:"#FFD700" },
                  { e:"🌸", v:gs.flowers,             l:"Flowers", bg:"#fce4ec", b:"#e91e63" },
                  { e:"📖", v:totalStories,            l:"Stories", bg:"#e8f5e9", b:"#4caf50" },
                  { e:"🔥", v:gs.perfectStreak || 0,  l:"Streak",  bg:"#fff3e0", b:"#ff9800" },
                ].map(({ e, v, l, bg, b }) => (
                  <div key={l} style={{ background:bg, border:`2px solid ${b}`, borderRadius:14, padding:"9px 10px", display:"flex", alignItems:"center", gap:8, boxShadow:`0 3px 0 0 ${b}55` }}>
                    <span style={{ fontSize:20 }}>{e}</span>
                    <div>
                      <div style={{ fontSize:18, fontWeight:900, color:"#2a3a2a", fontFamily:font, lineHeight:1 }}>{v}</div>
                      <div style={{ fontSize:10, fontWeight:700, color:"#6a8a6a", fontFamily:font }}>{l}</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pip + message */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, minWidth:90, maxWidth:110 }}>
                <PipFace/>
                <div style={{ fontSize:11, fontWeight:700, color:"#3a5a3a", fontFamily:font, textAlign:"center", lineHeight:1.35 }}>
                  {pipMsg}
                </div>
              </div>
            </div>

            {/* ── SECTION 2: Activity Scores (compact bar rows) ── */}
            <div style={card}>
              <div style={{ fontSize:14, fontWeight:800, color:"#3a5a2a", marginBottom:10, fontFamily:font }}>
                Activity Scores 🚀
              </div>
              {totalStories === 0 ? (
                <div style={{ fontSize:13, color:"#bbb", fontWeight:600, fontFamily:font, padding:"6px 0" }}>
                  Complete a full story to see scores 🌱
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {ALL_ACTIVITIES.map((a) => {
                    const meta = ACTIVITY_META[a];
                    const pct  = scores[a];
                    return (
                      <div key={a} style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:16, flexShrink:0 }}>{meta.emoji}</span>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
                            <span style={{ fontSize:12, fontWeight:700, color:"#3a3a5a", fontFamily:font }}>{meta.label}</span>
                            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                              <StarRating pct={pct}/>
                              <span style={{ fontSize:12, fontWeight:800, color:"#2a3a2a", fontFamily:font, minWidth:30, textAlign:"right" }}>
                                {pct === 0 ? "—" : `${pct}%`}
                              </span>
                            </div>
                          </div>
                          <div style={{ background:"#eef0ea", borderRadius:6, height:8, overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${meta.bar}cc,${meta.bar})`, borderRadius:6, transition:"width .8s ease" }}/>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── SECTION 3: Garden + Achievements side-by-side ── */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>

              {/* Garden */}
              <div style={{ ...card, display:"flex", flexDirection:"column", gap:8 }}>
                <div style={{ fontSize:14, fontWeight:800, color:"#3a5a2a", fontFamily:font }}>My Garden 🌱</div>
                <div style={{ fontSize:11, fontWeight:600, color:"#7a9a6a", fontFamily:font }}>
                  <span style={{ textTransform:"capitalize" }}>{gs.currentStage}</span> · {gs.flowers} 🌸
                </div>
                <div style={{ background:"#e0f0cc", borderRadius:8, height:8, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${Math.min(100,(gs.stageIndex/5)*100)}%`, background:"linear-gradient(90deg,#5BBD4E,#27ae60)", borderRadius:8, transition:"width .8s ease" }}/>
                </div>
                <div style={{ transform:"scale(0.85)", transformOrigin:"top center", marginTop:-8 }}>
                  <Garden currentStage={gs.currentStage} flowers={gs.flowers}/>
                </div>
                <div style={{ fontSize:11, fontWeight:600, color:"#5a7a5a", fontFamily:font, textAlign:"center", marginTop:-4 }}>
                  {gs.currentStage === "flower"
                    ? "Full bloom! 🌸"
                    : `${5 - gs.stageIndex} more to next stage`}
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

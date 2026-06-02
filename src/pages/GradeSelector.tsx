import { useNavigate } from "react-router-dom";
import DynamicSky from "@/components/DynamicSky";
import { GRADE_META, setGradeLevel, type GradeLevel } from "@/lib/gradeLevel";

type Props = { onSelect?: (grade: GradeLevel) => void };

const font = "'Nunito',sans-serif";

function PipSmall() {
  return (
    <svg width="56" height="56" viewBox="0 0 64 64" className="animate-pip-float" aria-hidden>
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

export default function GradeSelector({ onSelect }: Props) {
  const navigate = useNavigate();

  const handleSelect = (grade: GradeLevel) => {
    if (onSelect) {
      onSelect(grade);
    } else {
      setGradeLevel(grade);
      navigate("/", { replace: true });
    }
  };

  return (
    <DynamicSky>
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 16px" }}>
        <div style={{ width:"100%", maxWidth:460, background:"#fff", borderRadius:24, boxShadow:"0 12px 40px rgba(0,0,0,.16)", overflow:"hidden" }}>

          {/* Header */}
          <div style={{ background:"linear-gradient(135deg,#5BBD4E,#27ae60)", padding:"28px 28px 22px", textAlign:"center" }}>
            <PipSmall/>
            <div style={{ fontSize:22, fontWeight:900, color:"#fff", fontFamily:font, marginTop:10, textShadow:"0 2px 8px rgba(0,0,0,.2)" }}>
              Welcome to ELA Growth Garden! 🌱
            </div>
            <div style={{ fontSize:14, fontWeight:600, color:"rgba(255,255,255,.88)", marginTop:6, fontFamily:font }}>
              What grade are you in? I'll find the perfect stories for you!
            </div>
          </div>

          {/* Grade cards */}
          <div style={{ padding:"20px 20px 24px", display:"flex", flexDirection:"column", gap:10 }}>
            {([1, 2, 3, 4, 5] as GradeLevel[]).map((grade) => {
              const m = GRADE_META[grade];
              return (
                <button
                  key={grade}
                  type="button"
                  onClick={() => handleSelect(grade)}
                  style={{
                    background: m.color,
                    border: "2.5px solid rgba(255,255,255,.8)",
                    borderRadius: 18,
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    cursor: "pointer",
                    boxShadow: `0 5px 0 0 ${m.shadow}`,
                    transition: "transform .15s, box-shadow .15s",
                    textAlign: "left",
                    width: "100%",
                    fontFamily: font,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 0 0 ${m.shadow}`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 5px 0 0 ${m.shadow}`;
                  }}
                >
                  <div style={{ fontSize: 32, flexShrink: 0 }}>{m.emoji}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#2a3a2a" }}>{m.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#4a6a4a", marginTop: 2 }}>{m.tagline}</div>
                  </div>
                  <div style={{ marginLeft:"auto", fontSize:20, color:"rgba(0,0,0,.25)" }}>›</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </DynamicSky>
  );
}

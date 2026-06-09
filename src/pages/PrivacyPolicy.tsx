import { Link } from "react-router-dom";
import DynamicSky from "@/components/DynamicSky";

const font = "'Nunito',sans-serif";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 28 }}>
    <h2 style={{ fontSize: 17, fontWeight: 800, color: "#1a3d1f", fontFamily: font, marginBottom: 8 }}>{title}</h2>
    <div style={{ fontSize: 14, color: "#3a5a3a", fontFamily: font, lineHeight: 1.8 }}>{children}</div>
  </div>
);

export default function PrivacyPolicy() {
  return (
    <DynamicSky>
      <div style={{ minHeight: "100vh", padding: "32px 16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: 720, background: "#fff", borderRadius: 24, boxShadow: "0 12px 40px rgba(0,0,0,.12)", overflow: "hidden" }}>

          <div style={{ background: "linear-gradient(135deg,#5BBD4E,#27ae60)", padding: "32px 32px 28px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🌱</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", fontFamily: font, margin: 0 }}>
              Privacy Policy
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.85)", fontFamily: font, marginTop: 6, marginBottom: 0 }}>
              ELA Growth Garden · Effective date: June 9, 2026 · Version 1.1
            </p>
          </div>

          <div style={{ padding: "32px 36px 40px" }}>

            <div style={{ background: "#fffbe6", border: "1px solid #ffe066", borderRadius: 12, padding: "14px 18px", marginBottom: 28, fontSize: 13, fontFamily: font, color: "#7a5c00", lineHeight: 1.7 }}>
              <strong>COPPA Notice:</strong> ELA Growth Garden is directed to children under 13 and is intended
              to be used under the supervision of a parent or guardian. We do not knowingly collect personal
              information from children without verifiable parental consent. If you believe your child has
              provided personal information without your consent, please contact us immediately at{" "}
              <strong>elagrowthgarden.privacy@gmail.com</strong>.
            </div>

            <Section title="1. Who We Are">
              ELA Growth Garden ("we", "us", "our") is an educational reading app for children in grades 1–5.
              This Privacy Policy explains how we collect, use, and protect information about children and
              their parents or guardians ("you").
            </Section>

            <Section title="2. Information We Collect">
              <p style={{ marginBottom: 8 }}>We collect only what is necessary to provide the service:</p>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li><strong>Parent/Guardian account:</strong> email address and password (password is hashed — never stored in plain text).</li>
                <li><strong>Child profile:</strong> first name and grade level (1–5), entered by the parent in the Parent Dashboard.</li>
                <li><strong>Learning activity data:</strong> reading progress, quiz answers, scores, and time spent per session — linked to your account ID, not your name.</li>
                <li><strong>Consent record:</strong> timestamp and a hashed IP address confirming parental consent was given.</li>
              </ul>
              <p style={{ marginTop: 8 }}>
                We do <strong>not</strong> collect: home address, phone number, photos, precise geolocation,
                device identifiers, or any information from social media accounts beyond the email provided
                by Google OAuth.
              </p>
            </Section>

            <Section title="3. How We Use Information">
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li>To provide and personalise the learning experience.</li>
                <li>To show parents their child's progress in the Parent Dashboard.</li>
                <li>To generate age-appropriate reading stories and questions using an AI service (Google Gemini). Only the child's grade level is sent — never their name or account ID.</li>
                <li>To maintain platform security and prevent abuse.</li>
              </ul>
              <p style={{ marginTop: 8 }}>We do <strong>not</strong> sell, rent, or share personal information with third-party advertisers.</p>
            </Section>

            <Section title="4. Parental Consent (COPPA)">
              Before any personal information is collected for a child under 13, we require a parent or
              guardian to:
              <ol style={{ paddingLeft: 20, marginTop: 8, marginBottom: 0 }}>
                <li>Create an account using a parent/guardian email address.</li>
                <li>Confirm they are 18 or older and accept this Privacy Policy.</li>
                <li>Acknowledge they are setting up the account for their child.</li>
              </ol>
              <p style={{ marginTop: 8 }}>
                Parents may review, update, or delete their child's information at any time via the{" "}
                <Link to="/delete-account" style={{ color: "#27ae60", fontWeight: 700 }}>Account Deletion page</Link>{" "}
                or by emailing <strong>elagrowthgarden.privacy@gmail.com</strong>.
              </p>
            </Section>

            <Section title="5. Data Retention">
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li>Learning activity data is automatically deleted after <strong>90 days</strong>.</li>
                <li>Account data is retained until you delete your account.</li>
                <li>Parental consent records are kept for <strong>365 days after account deletion</strong> for legal compliance, then permanently deleted.</li>
              </ul>
            </Section>

            <Section title="6. Data Security">
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li>Passwords are hashed using bcrypt by Supabase Auth — we never see your password.</li>
                <li>Parent PINs are hashed with SHA-256 before storage.</li>
                <li>All database tables use Row-Level Security — no user can access another user's data.</li>
                <li>All data is transmitted over HTTPS/TLS.</li>
              </ul>
            </Section>

            <Section title="7. Third-Party Services">
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li><strong>Supabase</strong> (database and authentication) — processes data under GDPR/privacy frameworks.</li>
                <li><strong>Google Gemini AI</strong> — receives only grade level and genre to generate stories. No personal information is sent.</li>
                <li><strong>Google OAuth</strong> — only if you choose "Sign in with Google". Google's privacy policy applies to the OAuth exchange.</li>
              </ul>
            </Section>

            <Section title="8. Your Rights">
              You have the right to:
              <ul style={{ paddingLeft: 20, marginTop: 8, marginBottom: 0 }}>
                <li><strong>Access</strong> your child's data — contact us or use the Parent Dashboard.</li>
                <li><strong>Correct</strong> inaccurate information — via the Parent Dashboard.</li>
                <li><strong>Delete</strong> all data and close the account — via the{" "}
                  <Link to="/delete-account" style={{ color: "#27ae60", fontWeight: 700 }}>Account Deletion page</Link>.</li>
                <li><strong>Withdraw consent</strong> — deleting your account withdraws consent and erases all data.</li>
              </ul>
            </Section>

            <Section title="9. Contact Us">
              For any privacy questions or to exercise your rights, contact:<br />
              <strong>Email:</strong>elagrowthgarden.privacy@gmail.com<br />
              We will respond within 5 business days.
            </Section>

            <Section title="10. Changes to This Policy">
              We will notify you by email and show a notice in the app if we make material changes.
              Continued use after the notice period constitutes acceptance.
            </Section>

            <div style={{ marginTop: 32, textAlign: "center" }}>
              <Link
                to="/"
                style={{ display: "inline-block", background: "linear-gradient(135deg,#5BBD4E,#27ae60)", color: "#fff", borderRadius: 14, padding: "12px 28px", fontSize: 14, fontWeight: 800, textDecoration: "none", fontFamily: font }}
              >
                ← Back to Garden
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DynamicSky>
  );
}

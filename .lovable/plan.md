

# The ELA Growth Garden 🌱📚

A fun, interactive reading comprehension app for kids ages 7-10, with AI-powered story generation and a growing garden that rewards correct answers.

## Pages & Layout

### Landing Page
- Warm, paper-textured background with the app title "The ELA Growth Garden" and a friendly tagline
- 5 colorful, rounded buttons in a grid: Vocabulary, Compare & Contrast, Fact vs Opinion, Summaries, Character Traits
- Each button has a unique color and icon

### Activity Page (split layout)
- **Left side (~65%)**: Story content + questions area
- **Right side (~35%)**: Garden visualization showing plant growth progress

## 5 Activity Modes

1. **Vocabulary** — AI generates a ~200-word story, highlights 5 challenging words in bold, asks the user to pick/type meanings. Each correct answer earns a star (varied star styles).

2. **Compare & Contrast** — AI generates 2 short stories. One comparing question is shown. User writes similarities and differences in text areas.

3. **Fact vs Opinion** — AI generates a story + related statements. User labels each as Fact or Opinion.

4. **Summaries** — AI generates a story + 3 summary options (multiple choice). User picks the best one.

5. **Character Traits** — AI generates a story with a clear character, then asks 3 trait-related questions. User responds via text or multiple choice.

## Growth Garden System

- Garden area on the right side with a visual plant that progresses through 4 stages: **Seed → Sprout → Leaves → Bud → Flower**
- Each correct answer advances the plant one stage
- Animated transitions between stages (CSS animations)
- Once a flower blooms, a new seed starts — building a row of flowers over time
- Stars collected from Vocabulary mode displayed above the garden

## AI-Powered Content

- Uses Lovable AI (via edge function) to generate age-appropriate stories
- Tracks a "level" starting at grade 2, incrementing toward grade 5 as the user progresses
- The AI prompt includes the current grade level to adjust vocabulary and complexity
- Questions and answer options are also AI-generated with correct answers marked

## Design

- Soft paper-texture background (CSS pattern)
- Lexend font for body text, rounded playful headings
- Large, rounded, colorful buttons with hover animations
- Kid-friendly color palette: soft greens, warm yellows, sky blues, gentle purples
- Encouraging feedback messages ("Great job! 🌟", "Keep growing! 🌱")

## Tech

- React + Tailwind for UI
- Lovable Cloud edge function for AI story/question generation
- Local state (React useState) for tracking level, garden progress, and stars — no database needed


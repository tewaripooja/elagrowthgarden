import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 8080,
    hmr: { overlay: true },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    // Silence the warning — chunks are split below so nothing stays above 600 kB
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — tiny, loaded first
          "vendor-react": ["react", "react-dom", "react/jsx-runtime"],
          // Routing
          "vendor-router": ["react-router-dom"],
          // Data fetching
          "vendor-query": ["@tanstack/react-query"],
          // Supabase client
          "vendor-supabase": ["@supabase/supabase-js"],
          // UI component library (radix + shadcn)
          "vendor-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-tabs",
            "@radix-ui/react-slot",
            "@radix-ui/react-label",
            "@radix-ui/react-select",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-accordion",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-switch",
          ],
          // Game components (boss battle, characters, arena)
          "game": [
            "./src/components/game/BossEncounter",
            "./src/components/game/BattleArena",
            "./src/components/game/FrostbiteCharacter",
            "./src/components/game/PipBattleCharacter",
          ],
          // Activity components — loaded only on the Activity page
          "activities": [
            "./src/components/activities/Vocabulary",
            "./src/components/activities/FactOpinion",
            "./src/components/activities/Summaries",
            "./src/components/activities/CharacterTraits",
            "./src/components/activities/CompareContrast",
          ],
        },
      },
    },
  },
}));

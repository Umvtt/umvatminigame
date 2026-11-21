import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Project pages live at https://<user>.github.io/<repo>/ — override with BASE=/ for a custom domain.
export default defineConfig({
  base: process.env.BASE ?? "/umvatminigame/",
  plugins: [react()],
});

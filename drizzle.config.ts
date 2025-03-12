
import { defineConfig } from "drizzle-kit";

// Como estamos usando Firebase, não precisamos desta configuração
// mas mantemos o arquivo para compatibilidade

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: "placeholder", // Este valor não será usado
  },
});

import { betterAuth } from "better-auth"

// Configuração do Better Auth com Supabase
export const auth = betterAuth({
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/postgres"
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "encontrista"
      }
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24, // 1 dia
  },
  trustedOrigins: ["http://localhost:5173"],
  baseURL: "http://localhost:3000",
})

// Tipos para TypeScript
export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.User

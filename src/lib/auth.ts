import { betterAuth } from "better-auth"

// Configuração do Better Auth
export const auth = betterAuth({
  database: {
    provider: "sqlite",
    url: ":memory:" // Banco em memória para teste
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
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

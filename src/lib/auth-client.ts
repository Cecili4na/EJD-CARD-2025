import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000", // URL do servidor de autenticação
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient


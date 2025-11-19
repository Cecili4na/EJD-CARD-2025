/**
 * Cliente Supabase com Service Role Key
 * Acesso total ao banco (sem RLS)
 */

import { createClient } from '@supabase/supabase-js'

if (!process.env.VITE_SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL não configurado')
}

if (!process.env.VITE_SUPABASE_SERVICE_ROLE_KEY && !process.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Chave do Supabase não configurada (SERVICE_ROLE_KEY ou ANON_KEY)')
}

// Usar service role key se disponível, senão usar anon key (para desenvolvimento)
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  supabaseKey
)


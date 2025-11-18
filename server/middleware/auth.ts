/**
 * Middleware de Autenticação
 * Valida JWT e extrai informações do usuário
 */

import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase'
import { UserRole } from '../lib/permissions'

export interface AuthRequest extends Request {
  user: {
    id: string
    email: string
    role: UserRole
  }
}

/**
 * Middleware para autenticar requisições via JWT
 */
export async function authenticate(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  const authHeader = req.headers.authorization
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  // Adicionar user ao request
  ;(req as AuthRequest).user = {
    id: user.id,
    email: user.email!,
    role: (user.user_metadata?.role || 'guest') as UserRole,
  }

  next()
}


-- Script para configurar Better Auth no Supabase
-- Execute este script no SQL Editor do Supabase

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS "user" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "email" TEXT UNIQUE NOT NULL,
  "name" TEXT,
  "role" TEXT DEFAULT 'encontrista',
  "email_verified" BOOLEAN DEFAULT false,
  "image" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sessões
CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "token" TEXT UNIQUE NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de contas (para OAuth)
CREATE TABLE IF NOT EXISTS "account" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "account_id" TEXT NOT NULL,
  "provider_id" TEXT NOT NULL,
  "access_token" TEXT,
  "refresh_token" TEXT,
  "id_token" TEXT,
  "access_token_expires_at" TIMESTAMP WITH TIME ZONE,
  "refresh_token_expires_at" TIMESTAMP WITH TIME ZONE,
  "scope" TEXT,
  "password" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("provider_id", "account_id")
);

-- Tabela de verificação
CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS "idx_session_user_id" ON "session"("user_id");
CREATE INDEX IF NOT EXISTS "idx_session_token" ON "session"("token");
CREATE INDEX IF NOT EXISTS "idx_account_user_id" ON "account"("user_id");
CREATE INDEX IF NOT EXISTS "idx_verification_identifier" ON "verification"("identifier");
CREATE INDEX IF NOT EXISTS "idx_verification_value" ON "verification"("value");

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "user" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_session_updated_at BEFORE UPDATE ON "session" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_account_updated_at BEFORE UPDATE ON "account" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_verification_updated_at BEFORE UPDATE ON "verification" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuário admin padrão (apenas se não existir)
INSERT INTO "user" (id, email, name, role, email_verified) 
VALUES (
  'admin_ana_cecilia',
  'ana.ceci7373@gmail.com',
  'Ana Cecilia',
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- Habilitar Row Level Security (RLS)
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS básicas
-- Usuários podem ver seus próprios dados
CREATE POLICY "Users can view own data" ON "user" FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own data" ON "user" FOR UPDATE USING (auth.uid()::text = id);

-- Sessões são visíveis pelo usuário
CREATE POLICY "Sessions are viewable by user" ON "session" FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Sessions are insertable by user" ON "session" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Sessions are deletable by user" ON "session" FOR DELETE USING (auth.uid()::text = user_id);

-- Contas são visíveis pelo usuário
CREATE POLICY "Accounts are viewable by user" ON "account" FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Accounts are insertable by user" ON "account" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Accounts are updatable by user" ON "account" FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Accounts are deletable by user" ON "account" FOR DELETE USING (auth.uid()::text = user_id);

-- Admin pode ver todos os usuários
CREATE POLICY "Admins can view all users" ON "user" FOR ALL USING (
  EXISTS (
    SELECT 1 FROM "user" 
    WHERE id = auth.uid()::text 
    AND role = 'admin'
  )
);

-- Comentários das tabelas
COMMENT ON TABLE "user" IS 'Better Auth users table';
COMMENT ON TABLE "session" IS 'Better Auth sessions table';
COMMENT ON TABLE "account" IS 'Better Auth accounts table';
COMMENT ON TABLE "verification" IS 'Better Auth verification table';

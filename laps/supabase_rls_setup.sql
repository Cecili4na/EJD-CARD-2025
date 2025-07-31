-- Habilitar RLS na tabela
ALTER TABLE public.backup_autos_venda ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura para usuários autenticados
CREATE POLICY "Usuários autenticados podem ler backup_autos_venda" 
ON public.backup_autos_venda
FOR SELECT 
TO authenticated
USING (true);

-- Criar política para permitir inserção para usuários autenticados (se necessário)
CREATE POLICY "Usuários autenticados podem inserir backup_autos_venda" 
ON public.backup_autos_venda
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Criar política para permitir atualização para usuários autenticados (se necessário)
CREATE POLICY "Usuários autenticados podem atualizar backup_autos_venda" 
ON public.backup_autos_venda
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Criar política para permitir exclusão para usuários autenticados (se necessário)
CREATE POLICY "Usuários autenticados podem deletar backup_autos_venda" 
ON public.backup_autos_venda
FOR DELETE 
TO authenticated
USING (true);

-- Habilitar RLS na tabela de itens
ALTER TABLE public.backup_autos_itens ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura para usuários autenticados
CREATE POLICY "Usuários autenticados podem ler backup_autos_itens" 
ON public.backup_autos_itens
FOR SELECT 
TO authenticated
USING (true);

-- Criar política para permitir inserção para usuários autenticados (se necessário)
CREATE POLICY "Usuários autenticados podem inserir backup_autos_itens" 
ON public.backup_autos_itens
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Criar política para permitir atualização para usuários autenticados (se necessário)
CREATE POLICY "Usuários autenticados podem atualizar backup_autos_itens" 
ON public.backup_autos_itens
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Criar política para permitir exclusão para usuários autenticados (se necessário)
CREATE POLICY "Usuários autenticados podem deletar backup_autos_itens" 
ON public.backup_autos_itens
FOR DELETE 
TO authenticated
USING (true); 
-- Tornar a tabela privada (não acessível via API pública)
REVOKE ALL ON public.backup_autos_venda FROM anon;
REVOKE ALL ON public.backup_autos_venda FROM authenticated;

-- Ou, se quiser permitir apenas leitura para usuários autenticados:
-- GRANT SELECT ON public.backup_autos_venda TO authenticated;

-- Tornar a tabela de itens privada também
REVOKE ALL ON public.backup_autos_itens FROM anon;
REVOKE ALL ON public.backup_autos_itens FROM authenticated;

-- Ou, se quiser permitir apenas leitura para usuários autenticados:
-- GRANT SELECT ON public.backup_autos_itens TO authenticated; 
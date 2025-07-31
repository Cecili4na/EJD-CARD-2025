-- Script para criar tabela de itens de venda (opcional)
-- Esta tabela permitiria armazenar os detalhes dos serviços e peças

CREATE TABLE public.backup_autos_itens (
  "Codigo" bigint generated always as identity not null,
  "Venda_Codigo" bigint not null,
  "Descricao" text not null,
  "Quantidade" integer not null default 1,
  "Valor_Unitario" numeric(10, 2) not null default 0.00,
  "Valor_Total" numeric(10, 2) not null default 0.00,
  "Tipo" text null, -- 'peca', 'servico', 'material'
  "Observacao" text null,
  "Data_Cadastro" timestamp without time zone default now(),
  constraint backup_autos_itens_pkey primary key ("Codigo"),
  constraint fk_venda_codigo foreign key ("Venda_Codigo") references public.backup_autos_venda("Codigo") on delete cascade
) TABLESPACE pg_default;

-- Criar índices para melhorar performance
CREATE INDEX idx_backup_autos_itens_venda ON public.backup_autos_itens ("Venda_Codigo");
CREATE INDEX idx_backup_autos_itens_tipo ON public.backup_autos_itens ("Tipo");

-- Habilitar RLS na tabela de itens
ALTER TABLE public.backup_autos_itens ENABLE ROW LEVEL SECURITY;

-- Criar políticas para a tabela de itens
CREATE POLICY "Usuários autenticados podem ler backup_autos_itens" 
ON public.backup_autos_itens
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem inserir backup_autos_itens" 
ON public.backup_autos_itens
FOR INSERT 
TO authenticated
WITH CHECK (true); 
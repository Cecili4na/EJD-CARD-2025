-- Script para buscar uma placa específica no Supabase
-- Substitua 'ABC1234' pela placa que você quer buscar

-- 1. Buscar apenas os dados da venda (tabela backup_autos_venda)
SELECT 
    "Codigo",
    "Cliente_Nome",
    "Cliente_Endereço",
    "Cliente_Bairro", 
    "Cliente_Cidade",
    "Cliente_Telefone_Residência",
    "Placa",
    "Veículo",
    quilometragem,
    "Valor",
    "Dia",
    "Mês",
    "Ano",
    "Data_Lancamento",
    "Cliente_Codigo",
    "Mecanico_Codigo",
    pago,
    "ValorPago"
FROM public.backup_autos_venda 
WHERE "Placa" = 'ABC1234'  -- Substitua pela placa desejada
ORDER BY "Data_Lancamento" DESC;

-- 2. Buscar vendas com JOIN dos itens (dados completos)
SELECT 
    v."Codigo" as codigo_venda,
    v."Cliente_Nome",
    v."Cliente_Endereço",
    v."Cliente_Cidade",
    v."Placa",
    v."Veículo",
    v.quilometragem,
    v."Valor" as valor_total,
    v."Dia",
    v."Mês", 
    v."Ano",
    v."Data_Lancamento",
    i."Codigo" as codigo_item,
    i."Descrição" as descricao_item,
    i."Quantidade",
    i."Unidade",
    i."Valor" as valor_item,
    i."Código_Produto"
FROM public.backup_autos_venda v
LEFT JOIN public.backup_autos_itens i ON v."Codigo" = i."Código_Documento"
WHERE v."Placa" = 'ABC1234'  -- Substitua pela placa desejada
ORDER BY v."Data_Lancamento" DESC, i."Codigo";

-- 3. Contar quantos registros existem para a placa
SELECT 
    COUNT(*) as total_vendas,
    COUNT(DISTINCT v."Codigo") as vendas_unicas,
    COUNT(i."Codigo") as total_itens
FROM public.backup_autos_venda v
LEFT JOIN public.backup_autos_itens i ON v."Codigo" = i."Código_Documento"
WHERE v."Placa" = 'ABC1234';  -- Substitua pela placa desejada

-- 4. Buscar apenas os itens de uma placa específica
SELECT 
    i."Codigo",
    i."Código_Documento",
    i."Código_Produto",
    i."Descrição",
    i."Quantidade",
    i."Unidade",
    i."Valor",
    v."Placa",
    v."Veículo",
    v."Data_Lancamento"
FROM public.backup_autos_itens i
JOIN public.backup_autos_venda v ON i."Código_Documento" = v."Codigo"
WHERE v."Placa" = 'ABC1234'  -- Substitua pela placa desejada
ORDER BY v."Data_Lancamento" DESC, i."Codigo";

-- 5. Buscar todas as placas que começam com 'ABC' (exemplo)
SELECT DISTINCT "Placa", COUNT(*) as total_vendas
FROM public.backup_autos_venda 
WHERE "Placa" LIKE 'ABC%'
GROUP BY "Placa"
ORDER BY "Placa"; 
-- Migration: create Sapatinho Veloz product and sales tables
-- Date: 2025-11-07

-- Tabela de produtos específicos do Sapatinho Veloz
CREATE TABLE IF NOT EXISTS public.sapatinho_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    description TEXT,
    stock INTEGER,
    image_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sapatinho_products_active ON public.sapatinho_products(active);
CREATE INDEX IF NOT EXISTS idx_sapatinho_products_name ON public.sapatinho_products(name);

-- Tabela de vendas do Sapatinho Veloz
CREATE TABLE IF NOT EXISTS public.sapatinho_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
    seller_id TEXT NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('completed', 'delivered')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sapatinho_sales_card_id ON public.sapatinho_sales(card_id);
CREATE INDEX IF NOT EXISTS idx_sapatinho_sales_created_at ON public.sapatinho_sales(created_at);

-- Itens das vendas do Sapatinho Veloz
CREATE TABLE IF NOT EXISTS public.sapatinho_sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sapatinho_sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.sapatinho_products(id),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sapatinho_sale_items_sale_id ON public.sapatinho_sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sapatinho_sale_items_product_id ON public.sapatinho_sale_items(product_id);

-- Trigger para manter updated_at em produtos
CREATE OR REPLACE TRIGGER update_sapatinho_products_updated_at
BEFORE UPDATE ON public.sapatinho_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Segurança em nível de linha
ALTER TABLE public.sapatinho_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sapatinho_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sapatinho_sale_items ENABLE ROW LEVEL SECURITY;

-- Políticas para sapatinho_products
CREATE POLICY IF NOT EXISTS "Users can view sapatinho products"
ON public.sapatinho_products
FOR SELECT
USING (active = true);

CREATE POLICY IF NOT EXISTS "Users can manage sapatinho products"
ON public.sapatinho_products
FOR ALL
USING (true);

-- Políticas para sapatinho_sales
CREATE POLICY IF NOT EXISTS "Users can view sapatinho sales"
ON public.sapatinho_sales
FOR SELECT
USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert sapatinho sales"
ON public.sapatinho_sales
FOR INSERT
WITH CHECK (true);

-- Políticas para sapatinho_sale_items
CREATE POLICY IF NOT EXISTS "Users can view sapatinho sale items"
ON public.sapatinho_sale_items
FOR SELECT
USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert sapatinho sale items"
ON public.sapatinho_sale_items
FOR INSERT
WITH CHECK (true);


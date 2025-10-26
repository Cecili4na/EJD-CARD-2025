-- Script de dados seed para Supabase
-- Execute este script após o supabase-setup.sql

-- Inserir produtos iniciais
INSERT INTO products (name, price, category, description, stock, active) VALUES
-- Produtos Lojinha
('Camiseta Encontrão', 25.00, 'lojinha', 'Camiseta oficial do evento', 50, true),
('Caneca Personalizada', 15.00, 'lojinha', 'Caneca com logo do Encontrão', 30, true),
('Chaveiro', 5.00, 'lojinha', 'Chaveiro do evento', 100, true),
('Boné', 20.00, 'lojinha', 'Boné com logo', 25, true),
('Mochila', 45.00, 'lojinha', 'Mochila do evento', 15, true),

-- Produtos Lanchonete
('Hambúrguer', 12.00, 'lanchonete', 'Hambúrguer artesanal', 100, true),
('Refrigerante', 4.00, 'lanchonete', 'Lata 350ml', 200, true),
('Batata Frita', 8.00, 'lanchonete', 'Porção média', 80, true),
('Hot Dog', 10.00, 'lanchonete', 'Hot dog completo', 60, true),
('Água', 2.50, 'lanchonete', 'Garrafa 500ml', 150, true),
('Suco Natural', 6.00, 'lanchonete', 'Suco de laranja', 40, true),
('Salgadinho', 3.00, 'lanchonete', 'Pacote 100g', 120, true);

-- Inserir alguns cartões de exemplo (opcional)
-- Descomente as linhas abaixo se quiser criar cartões de teste

/*
INSERT INTO cards (user_id, user_name, card_number, phone_number, balance) VALUES
('user_test_1', 'João Silva', '1234567890123456', '11999999999', 50.00),
('user_test_2', 'Maria Santos', '9876543210987654', '11888888888', 25.00),
('user_test_3', 'Pedro Costa', '1111222233334444', '11777777777', 100.00);
*/

-- Inserir transações de exemplo (opcional)
-- Descomente as linhas abaixo se quiser criar transações de teste

/*
-- Transações para o cartão 1
INSERT INTO transactions (card_id, amount, type, description, created_by) VALUES
((SELECT id FROM cards WHERE card_number = '1234567890123456'), 50.00, 'credit', 'Saldo inicial', 'system'),
((SELECT id FROM cards WHERE card_number = '1234567890123456'), -12.00, 'debit', 'Compra na lanchonete', 'seller_1');

-- Transações para o cartão 2
INSERT INTO transactions (card_id, amount, type, description, created_by) VALUES
((SELECT id FROM cards WHERE card_number = '9876543210987654'), 25.00, 'credit', 'Saldo inicial', 'system'),
((SELECT id FROM cards WHERE card_number = '9876543210987654'), -15.00, 'debit', 'Compra na lojinha', 'seller_2');
*/

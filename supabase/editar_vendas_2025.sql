-- ============================================
-- SCRIPT PARA EDITAR VENDAS DE 2025
-- ============================================
-- Use este script para corrigir os dados de vendas de 2025 diretamente no Supabase

-- EXEMPLO 1: Atualizar preço unitário de uma venda específica
-- UPDATE vendas 
-- SET preco_unitario = 15.00
-- WHERE numero_venda = 'V2025-000001';

-- EXEMPLO 2: Atualizar quantidade e preço de uma venda
-- UPDATE vendas 
-- SET quantidade = 5, preco_unitario = 20.00
-- WHERE numero_venda = 'V2025-000123';

-- EXEMPLO 3: Atualizar múltiplas vendas de um mesmo produto
-- UPDATE vendas 
-- SET preco_unitario = 25.00
-- WHERE peca_codigo = 'AR22' AND EXTRACT(YEAR FROM created_at) = 2025;

-- EXEMPLO 4: Atualizar vendas de dezembro que vieram com preço 0
UPDATE vendas 
SET preco_unitario = CASE 
    WHEN peca_codigo = 'AR33' THEN 2.00
    WHEN peca_codigo = 'AR5092' THEN 4.00
    WHEN peca_codigo = 'AR5648' THEN 8.00
    WHEN peca_codigo = 'AR5368' THEN 6.00
    WHEN peca_codigo = 'AR7654' THEN 12.00
    WHEN peca_codigo = 'AR7576' THEN 65.00
    WHEN peca_codigo = 'AR6190' THEN 18.00
    WHEN peca_codigo = 'AR8571' THEN 18.00
    WHEN peca_codigo = 'PQ171' THEN 15.00
    WHEN peca_codigo = '6202' THEN 5.00
    WHEN peca_codigo = 'AR6971' THEN 8.00
    WHEN peca_codigo = 'BJ1180' THEN 35.00
    WHEN peca_codigo = 'TR6173' THEN 28.00
    WHEN peca_codigo = 'AR5546' THEN 15.00
    WHEN peca_codigo = 'AR7591' THEN 15.00
    WHEN peca_codigo = 'AR6607' THEN 20.00
    WHEN peca_codigo = 'AR5553' THEN 25.00
    WHEN peca_codigo = 'AR5556' THEN 35.00
    WHEN peca_codigo = 'AR8572' THEN 36.00
    WHEN peca_codigo = 'BJ1073R' THEN 20.00
    WHEN peca_codigo = 'CV409' THEN 10.00
    WHEN peca_codigo = 'AR7590' THEN 8.00
    WHEN peca_codigo = 'AR5370' THEN 10.00
    WHEN peca_codigo = 'BJ1130' THEN 24.00
    WHEN peca_codigo = 'AR5786' THEN 6.00
    WHEN peca_codigo = 'AR6141' THEN 10.00
    WHEN peca_codigo = 'BJ1052' THEN 30.00
    WHEN peca_codigo = 'FP027' THEN 35.00
    ELSE preco_unitario
END
WHERE preco_unitario = 0 
  AND EXTRACT(YEAR FROM created_at) = 2025
  AND EXTRACT(MONTH FROM created_at) = 12;

-- EXEMPLO 5: Ver todas as vendas com preço 0 para verificar
SELECT 
    numero_venda,
    created_at::date as data,
    peca_codigo,
    quantidade,
    preco_unitario,
    total
FROM vendas 
WHERE preco_unitario = 0 
  AND EXTRACT(YEAR FROM created_at) = 2025
ORDER BY created_at;

-- EXEMPLO 6: Atualizar forma de pagamento
-- UPDATE vendas 
-- SET forma_pagamento = 'Dinheiro'
-- WHERE numero_venda = 'V2025-000001';

-- EXEMPLO 7: Atualizar cliente/veículo
-- UPDATE vendas 
-- SET cliente_veiculo = 'Toyota Corolla'
-- WHERE numero_venda = 'V2025-000001';

-- EXEMPLO 8: Ver resumo de vendas por mês de 2025
SELECT 
    EXTRACT(MONTH FROM created_at) as mes,
    COUNT(*) as total_vendas,
    SUM(total) as valor_total,
    AVG(total) as ticket_medio
FROM vendas 
WHERE EXTRACT(YEAR FROM created_at) = 2025
GROUP BY EXTRACT(MONTH FROM created_at)
ORDER BY mes;

-- EXEMPLO 9: Corrigir data de uma venda
-- UPDATE vendas 
-- SET created_at = '2025-01-15 10:30:00'
-- WHERE numero_venda = 'V2025-000001';

-- EXEMPLO 10: Deletar vendas duplicadas (CUIDADO!)
-- DELETE FROM vendas 
-- WHERE numero_venda IN ('V2025-000999', 'V2025-001000');

-- Script de Importação de Peças
-- Importa peças básicas com código e tipo
-- Preços e stock serão adicionados posteriormente pelo usuário

-- ============================================
-- PEÇAS - CATEGORIA: AR (Stabilizer)
-- ============================================

INSERT INTO pecas (codigo, tipo_id, categoria_id, nome, preco_custo, preco_venda, stock_atual, stock_minimo)
SELECT 
  codigo_temp,
  (SELECT id FROM tipos WHERE codigo = 'AR' LIMIT 1),
  (SELECT id FROM categorias WHERE nome = 'Stabilizer' LIMIT 1),
  codigo_temp, -- Nome temporário = código
  0, -- Preço custo a definir
  0, -- Preço venda a definir
  0, -- Stock atual
  5  -- Stock mínimo padrão
FROM (VALUES
  ('AR33'),
  ('AR222'),
  ('AR7619'),
  ('AR 6168A'),
  ('1A5590'),
  ('AR 7527'),
  ('AR 5379'),
  ('AR 7591'),
  ('AR 7590'),
  ('AR6066'),
  ('AR5394'),
  ('AR5359'),
  ('AR5149'),
  ('AR557'),
  ('AR74043'),
  ('AR6582a'),
  ('AR5557'),
  ('AR7448'),
  ('AR5786'),
  ('AR5370'),
  ('AR7654'),
  ('AR5546'),
  ('AR6607'),
  ('AR5553'),
  ('AR5556'),
  ('AR 5092'),
  ('AR 6195'),
  ('AR 5648'),
  ('AR 5368'),
  ('AR 7576'),
  ('AR 6190'),
  ('AR6971'),
  ('AR6141'),
  ('AR8572'),
  ('AR8369'),
  ('AR8571'),
  ('AR8570')
) AS temp(codigo_temp)
ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- PEÇAS - CATEGORIA: BJ (Ball Joints)
-- ============================================

INSERT INTO pecas (codigo, tipo_id, categoria_id, nome, preco_custo, preco_venda, stock_atual, stock_minimo)
SELECT 
  codigo_temp,
  (SELECT id FROM tipos WHERE codigo = 'BJ' LIMIT 1),
  (SELECT id FROM categorias WHERE nome = 'Ball Joints' LIMIT 1),
  codigo_temp,
  0, 0, 0, 5
FROM (VALUES
  ('BJ908'),
  ('BJ962'),
  ('BJ1050'),
  ('BJ1052'),
  ('BJ1021'),
  ('BJ1130'),
  ('BJ1073R'),
  ('BJ1180'),
  ('PQ171')
) AS temp(codigo_temp)
ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- PEÇAS - CATEGORIA: CS (Master Cylinder)
-- ============================================

INSERT INTO pecas (codigo, tipo_id, categoria_id, nome, preco_custo, preco_venda, stock_atual, stock_minimo)
SELECT 
  codigo_temp,
  (SELECT id FROM tipos WHERE codigo = 'CM' LIMIT 1),
  (SELECT id FROM categorias WHERE nome = 'Master Cylinder' LIMIT 1),
  codigo_temp,
  0, 0, 0, 5
FROM (VALUES
  ('CS612L'),
  ('CS612R'),
  ('CS304')
) AS temp(codigo_temp)
ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- PEÇAS - CATEGORIA: TR (Tirod Ends)
-- ============================================

INSERT INTO pecas (codigo, tipo_id, categoria_id, nome, preco_custo, preco_venda, stock_atual, stock_minimo)
SELECT 
  codigo_temp,
  (SELECT id FROM tipos WHERE codigo = 'TR' LIMIT 1),
  (SELECT id FROM categorias WHERE nome = 'Tirod Ends' LIMIT 1),
  codigo_temp,
  0, 0, 0, 5
FROM (VALUES
  ('TRO 6110'),
  ('TR 5339'),
  ('TR6173')
) AS temp(codigo_temp)
ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- PEÇAS - CATEGORIA: CV (CV Joint)
-- ============================================

INSERT INTO pecas (codigo, tipo_id, categoria_id, nome, preco_custo, preco_venda, stock_atual, stock_minimo)
SELECT 
  codigo_temp,
  (SELECT id FROM tipos WHERE codigo = 'PJ' LIMIT 1),
  (SELECT id FROM categorias WHERE nome = 'CV Joint' LIMIT 1),
  codigo_temp,
  0, 0, 0, 5
FROM (VALUES
  ('CV409')
) AS temp(codigo_temp)
ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- PEÇAS - CATEGORIA: FP (Fuel Pump)
-- ============================================

INSERT INTO pecas (codigo, tipo_id, categoria_id, nome, preco_custo, preco_venda, stock_atual, stock_minimo)
SELECT 
  codigo_temp,
  (SELECT id FROM tipos WHERE codigo = 'FP' LIMIT 1),
  (SELECT id FROM categorias WHERE nome = 'Fuel Pump' LIMIT 1),
  codigo_temp,
  0, 0, 0, 5
FROM (VALUES
  ('FP027')
) AS temp(codigo_temp)
ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- PEÇAS - CATEGORIA: PQ (Wheel Bearing)
-- ============================================

INSERT INTO pecas (codigo, tipo_id, categoria_id, nome, preco_custo, preco_venda, stock_atual, stock_minimo)
SELECT 
  codigo_temp,
  (SELECT id FROM tipos WHERE codigo = 'PQ' LIMIT 1),
  (SELECT id FROM categorias WHERE nome = 'Wheel Bearing' LIMIT 1),
  codigo_temp,
  0, 0, 0, 5
FROM (VALUES
  ('6202'),
  ('6206')
) AS temp(codigo_temp)
ON CONFLICT (codigo) DO NOTHING;

-- Mensagem de conclusão
DO $$
DECLARE
  total_pecas INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_pecas FROM pecas;
  RAISE NOTICE '✅ Peças importadas com sucesso!';
  RAISE NOTICE '📊 Total de peças no banco: %', total_pecas;
  RAISE NOTICE '💡 Agora você pode editar as peças para adicionar preços, stock e outros detalhes';
END $$;

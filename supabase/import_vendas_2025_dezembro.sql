-- ============================================
-- IMPORTAÇÃO DE HISTÓRICO DE VENDAS (DEZEMBRO - PARA EDIÇÃO)
-- ============================================
-- ATENÇÃO: Os preços nesta lista vieram como '0'. 
-- Execute este script e depois edite os preços no sistema PartQuip ou via SQL.

DO $$ 
DECLARE 
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  CREATE TEMP TABLE raw_data_import_dec (
    dt DATE,
    code TEXT,
    qty INT,
    price DECIMAL
  );

  INSERT INTO raw_data_import_dec (dt, code, qty, price) VALUES
  ('2025-12-03', 'AR33', 1, 0),
  ('2025-12-01', 'AR5092', 1, 0),
  ('2025-12-01', 'AR5648', 1, 0),
  ('2025-12-01', 'AR5368', 1, 0),
  ('2025-12-02', 'AR7654', 1, 0),
  ('2025-12-02', 'AR5092', 1, 0),
  ('2025-12-02', 'AR7576', 1, 0),
  ('2025-12-02', 'AR6190', 2, 0),
  ('2025-12-02', 'AR8571', 1, 0),
  ('2025-12-02', 'PQ171', 1, 0),
  ('2025-12-02', '6202', 1, 0),
  ('2025-12-03', 'AR6971', 1, 0),
  ('2025-12-03', 'BJ1180', 1, 0),
  ('2025-12-03', 'TR6173', 2, 0),
  ('2025-12-06', 'AR5546', 1, 0),
  ('2025-12-08', 'AR7591', 1, 0),
  ('2025-12-08', 'AR6607', 1, 0),
  ('2025-12-08', 'AR5553', 1, 0),
  ('2025-12-08', 'AR5556', 1, 0),
  ('2025-12-08', 'AR5092', 1, 0),
  ('2025-12-08', 'AR8572', 1, 0),
  ('2025-12-08', 'AR8572', 1, 0),
  ('2025-12-08', 'BJ1073R', 1, 0),
  ('2025-12-08', 'CV409', 1, 0),
  ('2025-12-09', 'AR8572', 1, 0),
  ('2025-12-09', 'AR8572', 2, 0),
  ('2025-12-10', 'AR7591', 1, 0),
  ('2025-12-10', 'AR7590', 1, 0),
  ('2025-12-10', 'AR5370', 1, 0),
  ('2025-12-10', 'AR7654', 1, 0),
  ('2025-12-10', 'BJ1130', 1, 0),
  ('2025-12-11', 'AR5786', 1, 0),
  ('2025-12-11', 'AR6141', 1, 0),
  ('2025-12-11', 'BJ1052', 2, 0),
  ('2025-12-13', 'FP027', 1, 0),
  ('2025-12-31', 'BJ1180', 1, 35),
  ('2025-12-31', '6202', 2, 0);

  -- INSERIR NA TABELA VENDAS JOINANDO COM PEÇAS
  INSERT INTO public.vendas (
    numero_venda,
    peca_id, 
    peca_codigo, 
    peca_nome, 
    quantidade, 
    preco_unitario, 
    created_at, 
    user_id, 
    status,
    updated_at
  )
  SELECT 
    'V2025-' || LPAD((ROW_NUMBER() OVER (ORDER BY r.dt) + 1000)::TEXT, 6, '0'),
    p.id, 
    p.codigo, 
    p.nome, 
    r.qty, 
    r.price, 
    r.dt::TIMESTAMP, 
    v_user_id, 
    'confirmada',
    NOW()
  FROM raw_data_import_dec r
  JOIN public.pecas p ON p.codigo = r.code;

  DROP TABLE raw_data_import_dec;
END $$;

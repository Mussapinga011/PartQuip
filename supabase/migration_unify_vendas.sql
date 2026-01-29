-- ============================================
-- MIGRATION: UNIFICAR TABELAS DE VENDAS
-- ============================================

-- 1. Renomear a tabela atual de 2026 para ser a tabela principal 'vendas'
-- Se vendas já existe (por algum teste anterior), garantimos que usamos a de produção.
-- Assumindo que vendas_2026 contém os dados reais.

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'vendas_2026') THEN
    ALTER TABLE vendas_2026 RENAME TO vendas;
  END IF;
END $$;

-- 2. Atualizar a função process_sale para usar apenas a tabela 'vendas'
CREATE OR REPLACE FUNCTION process_sale(sale_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_peca_id UUID;
  v_quantidade INTEGER;
  v_estoque_atual INTEGER;
  v_sale_id UUID;
BEGIN
  -- Extrair dados da venda
  v_peca_id := (sale_data->>'peca_id')::UUID;
  v_quantidade := (sale_data->>'quantidade')::INTEGER;
  
  -- Verificar estoque atual com lock para evitar race conditions
  SELECT estoque INTO v_estoque_atual
  FROM pecas
  WHERE id = v_peca_id
  FOR UPDATE; -- Lock pessimista
  
  -- Validar se há estoque suficiente
  IF v_estoque_atual IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Peça não encontrada');
  END IF;
  
  IF v_estoque_atual < v_quantidade THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Estoque insuficiente', 
      'estoque_disponivel', v_estoque_atual, 
      'quantidade_solicitada', v_quantidade
    );
  END IF;
  
  -- Atualizar estoque (baixa)
  UPDATE pecas
  SET 
    estoque = estoque - v_quantidade,
    updated_at = NOW()
  WHERE id = v_peca_id;
  
  -- Inserir venda na tabela única 'vendas'
  INSERT INTO vendas (
    peca_id, 
    quantidade, 
    preco_unitario, 
    desconto, 
    cliente_veiculo, 
    observacoes,
    user_id,
    created_at,
    updated_at,
    numero_venda,    -- Garantir que colunas novas também sejam inseridas se existirem
    vendedor_nome,
    forma_pagamento,
    status,
    peca_codigo,
    peca_nome,
    total
  ) VALUES (
    v_peca_id,
    v_quantidade,
    (sale_data->>'preco_unitario')::DECIMAL,
    COALESCE((sale_data->>'desconto')::DECIMAL, 0),
    sale_data->>'cliente_veiculo',
    sale_data->>'observacoes',
    (sale_data->>'user_id')::UUID,
    (sale_data->>'created_at')::TIMESTAMP,
    NOW(),
    sale_data->>'numero_venda',
    sale_data->>'vendedor_nome',
    sale_data->>'forma_pagamento',
    COALESCE(sale_data->>'status', 'confirmada'),
    sale_data->>'peca_codigo',
    sale_data->>'peca_nome',
    (sale_data->>'total')::DECIMAL
  ) RETURNING id INTO v_sale_id;
  
  -- Retornar sucesso com ID da venda
  RETURN jsonb_build_object(
    'success', true,
    'sale_id', v_sale_id,
    'estoque_restante', v_estoque_atual - v_quantidade
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 3. Atualizar Triggers da nova tabela 'vendas'
DROP TRIGGER IF EXISTS update_vendas_updated_at ON vendas;
CREATE TRIGGER update_vendas_updated_at 
  BEFORE UPDATE ON vendas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Atualizar Políticas RLS para tabela 'vendas'
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários autenticados podem ler vendas" ON vendas;
CREATE POLICY "Usuários autenticados podem ler vendas"
ON vendas FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias vendas" ON vendas;
CREATE POLICY "Usuários podem gerenciar suas próprias vendas"
ON vendas FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

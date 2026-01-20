-- ============================================
-- SCRIPT COMPLETO DE SETUP - PartQuip
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- ============================================
-- PARTE 1: ADICIONAR COLUNAS updated_at
-- ============================================

-- Adicionar coluna updated_at em todas as tabelas
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE tipos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE pecas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE compatibilidade_veiculos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE abastecimentos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Adicionar em tabelas de vendas (ajuste os anos conforme necessário)
ALTER TABLE vendas_2024 ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE vendas_2025 ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE vendas_2026 ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- PARTE 2: CRIAR FUNÇÃO DE TRIGGER
-- ============================================

-- Função para atualizar automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PARTE 3: CRIAR TRIGGERS
-- ============================================

-- Triggers para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_categorias_updated_at ON categorias;
CREATE TRIGGER update_categorias_updated_at 
  BEFORE UPDATE ON categorias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tipos_updated_at ON tipos;
CREATE TRIGGER update_tipos_updated_at 
  BEFORE UPDATE ON tipos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pecas_updated_at ON pecas;
CREATE TRIGGER update_pecas_updated_at 
  BEFORE UPDATE ON pecas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_compatibilidade_updated_at ON compatibilidade_veiculos;
CREATE TRIGGER update_compatibilidade_updated_at 
  BEFORE UPDATE ON compatibilidade_veiculos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fornecedores_updated_at ON fornecedores;
CREATE TRIGGER update_fornecedores_updated_at 
  BEFORE UPDATE ON fornecedores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_abastecimentos_updated_at ON abastecimentos;
CREATE TRIGGER update_abastecimentos_updated_at 
  BEFORE UPDATE ON abastecimentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendas_2024_updated_at ON vendas_2024;
CREATE TRIGGER update_vendas_2024_updated_at 
  BEFORE UPDATE ON vendas_2024
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendas_2025_updated_at ON vendas_2025;
CREATE TRIGGER update_vendas_2025_updated_at 
  BEFORE UPDATE ON vendas_2025
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendas_2026_updated_at ON vendas_2026;
CREATE TRIGGER update_vendas_2026_updated_at 
  BEFORE UPDATE ON vendas_2026
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PARTE 4: FUNÇÃO RPC PARA PROCESSAR VENDAS
-- ============================================

-- Função para processar venda com validação atômica de estoque
CREATE OR REPLACE FUNCTION process_sale(sale_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_peca_id UUID;
  v_quantidade INTEGER;
  v_estoque_atual INTEGER;
  v_year INTEGER;
  v_table_name TEXT;
  v_sale_id UUID;
  v_result JSONB;
BEGIN
  -- Extrair dados da venda
  v_peca_id := (sale_data->>'peca_id')::UUID;
  v_quantidade := (sale_data->>'quantidade')::INTEGER;
  v_year := EXTRACT(YEAR FROM (sale_data->>'created_at')::TIMESTAMP);
  v_table_name := 'vendas_' || v_year::TEXT;
  
  -- Verificar estoque atual com lock para evitar race conditions
  SELECT estoque INTO v_estoque_atual
  FROM pecas
  WHERE id = v_peca_id
  FOR UPDATE; -- Lock pessimista
  
  -- Validar se há estoque suficiente
  IF v_estoque_atual IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Peça não encontrada'
    );
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
  
  -- Inserir venda na tabela do ano correspondente
  EXECUTE format(
    'INSERT INTO %I (
      peca_id, 
      quantidade, 
      preco_unitario, 
      desconto, 
      cliente_veiculo, 
      observacoes,
      user_id,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
    v_table_name
  )
  USING 
    v_peca_id,
    v_quantidade,
    (sale_data->>'preco_unitario')::DECIMAL,
    COALESCE((sale_data->>'desconto')::DECIMAL, 0),
    sale_data->>'cliente_veiculo',
    sale_data->>'observacoes',
    (sale_data->>'user_id')::UUID,
    (sale_data->>'created_at')::TIMESTAMP,
    NOW()
  INTO v_sale_id;
  
  -- Retornar sucesso com ID da venda
  RETURN jsonb_build_object(
    'success', true,
    'sale_id', v_sale_id,
    'estoque_restante', v_estoque_atual - v_quantidade
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Rollback automático em caso de erro
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Garantir que a função pode ser executada por usuários autenticados
GRANT EXECUTE ON FUNCTION process_sale(JSONB) TO authenticated;

COMMENT ON FUNCTION process_sale IS 'Processa uma venda com validação atômica de estoque para evitar overselling';

-- ============================================
-- PARTE 5: HABILITAR RLS
-- ============================================

ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pecas ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibilidade_veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE abastecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas_2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas_2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas_2026 ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PARTE 6: POLÍTICAS RLS - CATEGORIAS
-- ============================================

DROP POLICY IF EXISTS "Usuários autenticados podem ler categorias" ON categorias;
CREATE POLICY "Usuários autenticados podem ler categorias"
ON categorias FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias categorias" ON categorias;
CREATE POLICY "Usuários podem gerenciar suas próprias categorias"
ON categorias FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- PARTE 7: POLÍTICAS RLS - TIPOS
-- ============================================

DROP POLICY IF EXISTS "Usuários autenticados podem ler tipos" ON tipos;
CREATE POLICY "Usuários autenticados podem ler tipos"
ON tipos FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios tipos" ON tipos;
CREATE POLICY "Usuários podem gerenciar seus próprios tipos"
ON tipos FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- PARTE 8: POLÍTICAS RLS - PEÇAS
-- ============================================

DROP POLICY IF EXISTS "Usuários autenticados podem ler peças" ON pecas;
CREATE POLICY "Usuários autenticados podem ler peças"
ON pecas FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias peças" ON pecas;
CREATE POLICY "Usuários podem gerenciar suas próprias peças"
ON pecas FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- PARTE 9: POLÍTICAS RLS - COMPATIBILIDADE
-- ============================================

DROP POLICY IF EXISTS "Usuários autenticados podem ler compatibilidade" ON compatibilidade_veiculos;
CREATE POLICY "Usuários autenticados podem ler compatibilidade"
ON compatibilidade_veiculos FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Usuários podem gerenciar sua própria compatibilidade" ON compatibilidade_veiculos;
CREATE POLICY "Usuários podem gerenciar sua própria compatibilidade"
ON compatibilidade_veiculos FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM pecas 
    WHERE pecas.id = compatibilidade_veiculos.peca_id 
    AND pecas.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pecas 
    WHERE pecas.id = compatibilidade_veiculos.peca_id 
    AND pecas.user_id = auth.uid()
  )
);

-- ============================================
-- PARTE 10: POLÍTICAS RLS - FORNECEDORES
-- ============================================

DROP POLICY IF EXISTS "Usuários autenticados podem ler fornecedores" ON fornecedores;
CREATE POLICY "Usuários autenticados podem ler fornecedores"
ON fornecedores FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios fornecedores" ON fornecedores;
CREATE POLICY "Usuários podem gerenciar seus próprios fornecedores"
ON fornecedores FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- PARTE 11: POLÍTICAS RLS - ABASTECIMENTOS
-- ============================================

DROP POLICY IF EXISTS "Usuários autenticados podem ler abastecimentos" ON abastecimentos;
CREATE POLICY "Usuários autenticados podem ler abastecimentos"
ON abastecimentos FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios abastecimentos" ON abastecimentos;
CREATE POLICY "Usuários podem gerenciar seus próprios abastecimentos"
ON abastecimentos FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- PARTE 12: POLÍTICAS RLS - VENDAS
-- ============================================

-- Vendas 2024
DROP POLICY IF EXISTS "Usuários autenticados podem ler vendas 2024" ON vendas_2024;
CREATE POLICY "Usuários autenticados podem ler vendas 2024"
ON vendas_2024 FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias vendas 2024" ON vendas_2024;
CREATE POLICY "Usuários podem gerenciar suas próprias vendas 2024"
ON vendas_2024 FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Vendas 2025
DROP POLICY IF EXISTS "Usuários autenticados podem ler vendas 2025" ON vendas_2025;
CREATE POLICY "Usuários autenticados podem ler vendas 2025"
ON vendas_2025 FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias vendas 2025" ON vendas_2025;
CREATE POLICY "Usuários podem gerenciar suas próprias vendas 2025"
ON vendas_2025 FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Vendas 2026
DROP POLICY IF EXISTS "Usuários autenticados podem ler vendas 2026" ON vendas_2026;
CREATE POLICY "Usuários autenticados podem ler vendas 2026"
ON vendas_2026 FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias vendas 2026" ON vendas_2026;
CREATE POLICY "Usuários podem gerenciar suas próprias vendas 2026"
ON vendas_2026 FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- PARTE 13: FUNÇÃO AUXILIAR PARA NOVAS TABELAS
-- ============================================

CREATE OR REPLACE FUNCTION create_vendas_rls_policies(year_table TEXT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Habilitar RLS
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', year_table);
  
  -- Política de leitura
  EXECUTE format(
    'CREATE POLICY "Usuários autenticados podem ler %s" 
     ON %I FOR SELECT 
     TO authenticated 
     USING (true)',
    year_table, year_table
  );
  
  -- Política de gerenciamento
  EXECUTE format(
    'CREATE POLICY "Usuários podem gerenciar suas próprias %s" 
     ON %I FOR ALL 
     TO authenticated 
     USING (user_id = auth.uid()) 
     WITH CHECK (user_id = auth.uid())',
    year_table, year_table
  );
END;
$$;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Verificar políticas criadas
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- SUCESSO!
-- ============================================
-- Se você chegou até aqui sem erros, tudo está configurado!
-- Próximos passos:
-- 1. Verifique os resultados da query acima
-- 2. Teste com diferentes usuários
-- 3. Atualize o código para usar sync-enhanced.js
-- ============================================

-- PartQuit - Supabase Database Schema
-- Sistema de Gestão de Peças Automotivas

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: categorias
-- ============================================
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) UNIQUE NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: tipos
-- ============================================
CREATE TABLE IF NOT EXISTS tipos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
  codigo VARCHAR(10) UNIQUE NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: fornecedores
-- ============================================
CREATE TABLE IF NOT EXISTS fornecedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(200) NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(100),
  endereco TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: pecas
-- ============================================
CREATE TABLE IF NOT EXISTS pecas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(50) UNIQUE NOT NULL,
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  tipo_id UUID REFERENCES tipos(id) ON DELETE SET NULL,
  nome VARCHAR(200) NOT NULL,
  preco_custo DECIMAL(10,2) NOT NULL DEFAULT 0,
  preco_venda DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock_atual INTEGER DEFAULT 0,
  stock_minimo INTEGER DEFAULT 5,
  localizacao VARCHAR(50),
  fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: compatibilidade_veiculos
-- ============================================
CREATE TABLE IF NOT EXISTS compatibilidade_veiculos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  ano INTEGER,
  categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
  codigos_compativeis TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: abastecimentos
-- ============================================
CREATE TABLE IF NOT EXISTS abastecimentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  peca_id UUID REFERENCES pecas(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL,
  valor_unitario DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: vendas_2026
-- ============================================
CREATE TABLE IF NOT EXISTS vendas_2026 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_venda VARCHAR(50) NOT NULL,
  peca_id UUID REFERENCES pecas(id) ON DELETE SET NULL,
  peca_codigo VARCHAR(50),
  peca_nome VARCHAR(200),
  categoria VARCHAR(100),
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) GENERATED ALWAYS AS (quantidade * preco_unitario) STORED,
  cliente_veiculo TEXT,
  vendedor VARCHAR(100),
  forma_pagamento VARCHAR(50),
  status VARCHAR(20) DEFAULT 'confirmada',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migração para tabelas existentes
ALTER TABLE vendas_2026 ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'confirmada';
ALTER TABLE vendas_2026 DROP CONSTRAINT IF EXISTS vendas_2026_numero_venda_key;


-- ============================================
-- TABELA: vendas_2027 (template para anos futuros)
-- ============================================
CREATE TABLE IF NOT EXISTS vendas_2027 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_venda VARCHAR(50) NOT NULL,
  peca_id UUID REFERENCES pecas(id) ON DELETE SET NULL,
  peca_codigo VARCHAR(50),
  peca_nome VARCHAR(200),
  categoria VARCHAR(100),
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) GENERATED ALWAYS AS (quantidade * preco_unitario) STORED,
  cliente_veiculo TEXT,
  vendedor VARCHAR(100),
  forma_pagamento VARCHAR(50),
  status VARCHAR(20) DEFAULT 'confirmada',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE vendas_2027 ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'confirmada';
ALTER TABLE vendas_2027 DROP CONSTRAINT IF EXISTS vendas_2027_numero_venda_key;


-- ============================================
-- ÍNDICES para Performance
-- ============================================

-- Índices para pecas
CREATE INDEX IF NOT EXISTS idx_pecas_codigo ON pecas(codigo);
CREATE INDEX IF NOT EXISTS idx_pecas_categoria ON pecas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_pecas_tipo ON pecas(tipo_id);
CREATE INDEX IF NOT EXISTS idx_pecas_fornecedor ON pecas(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_pecas_stock_baixo ON pecas(stock_atual) WHERE stock_atual < stock_minimo;

-- Índices para compatibilidade
CREATE INDEX IF NOT EXISTS idx_compat_marca ON compatibilidade_veiculos(marca);
CREATE INDEX IF NOT EXISTS idx_compat_modelo ON compatibilidade_veiculos(modelo);
CREATE INDEX IF NOT EXISTS idx_compat_categoria ON compatibilidade_veiculos(categoria_id);

-- Índices para vendas
CREATE INDEX IF NOT EXISTS idx_vendas_2026_data ON vendas_2026(created_at);
CREATE INDEX IF NOT EXISTS idx_vendas_2026_peca ON vendas_2026(peca_id);
CREATE INDEX IF NOT EXISTS idx_vendas_2027_data ON vendas_2027(created_at);
CREATE INDEX IF NOT EXISTS idx_vendas_2027_peca ON vendas_2027(peca_id);

-- Índices para abastecimentos
CREATE INDEX IF NOT EXISTS idx_abast_peca ON abastecimentos(peca_id);
CREATE INDEX IF NOT EXISTS idx_abast_fornecedor ON abastecimentos(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_abast_data ON abastecimentos(created_at);

-- ============================================
-- TRIGGERS para updated_at
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_categorias_updated_at ON categorias;
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tipos_updated_at ON tipos;
CREATE TRIGGER update_tipos_updated_at BEFORE UPDATE ON tipos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fornecedores_updated_at ON fornecedores;
CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON fornecedores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pecas_updated_at ON pecas;
CREATE TRIGGER update_pecas_updated_at BEFORE UPDATE ON pecas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_compat_updated_at ON compatibilidade_veiculos;
CREATE TRIGGER update_compat_updated_at BEFORE UPDATE ON compatibilidade_veiculos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pecas ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibilidade_veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE abastecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas_2026 ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas_2027 ENABLE ROW LEVEL SECURITY;

-- Políticas: Permitir tudo para usuários autenticados
DROP POLICY IF EXISTS "Permitir tudo para autenticados" ON categorias;
CREATE POLICY "Permitir tudo para autenticados" ON categorias
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir tudo para autenticados" ON tipos;
CREATE POLICY "Permitir tudo para autenticados" ON tipos
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir tudo para autenticados" ON fornecedores;
CREATE POLICY "Permitir tudo para autenticados" ON fornecedores
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir tudo para autenticados" ON pecas;
CREATE POLICY "Permitir tudo para autenticados" ON pecas
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir tudo para autenticados" ON compatibilidade_veiculos;
CREATE POLICY "Permitir tudo para autenticados" ON compatibilidade_veiculos
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir tudo para autenticados" ON abastecimentos;
CREATE POLICY "Permitir tudo para autenticados" ON abastecimentos
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir tudo para autenticados" ON vendas_2026;
CREATE POLICY "Permitir tudo para autenticados" ON vendas_2026
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir tudo para autenticados" ON vendas_2027;
CREATE POLICY "Permitir tudo para autenticados" ON vendas_2027
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- FUNÇÃO para criar tabela de vendas anual
-- ============================================

CREATE OR REPLACE FUNCTION criar_tabela_vendas_ano(ano INTEGER)
RETURNS VOID AS $$
DECLARE
  table_name TEXT := 'vendas_' || ano;
BEGIN
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      numero_venda VARCHAR(50) NOT NULL,
      peca_id UUID REFERENCES pecas(id) ON DELETE SET NULL,
      peca_codigo VARCHAR(50),
      peca_nome VARCHAR(200),
      categoria VARCHAR(100),
      quantidade INTEGER NOT NULL,
      preco_unitario DECIMAL(10,2) NOT NULL,
      total DECIMAL(10,2) GENERATED ALWAYS AS (quantidade * preco_unitario) STORED,
      cliente_veiculo TEXT,
      vendedor VARCHAR(100),
      forma_pagamento VARCHAR(50),
      status VARCHAR(20) DEFAULT ''confirmada'',
      observacoes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )', table_name);
  
  -- Habilitar RLS
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
  
  -- Criar política
  EXECUTE format('
    CREATE POLICY "Permitir tudo para autenticados" ON %I
      FOR ALL USING (auth.role() = ''authenticated'')
  ', table_name);
  
  -- Criar índices
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_data ON %I(created_at)', table_name, table_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_peca ON %I(peca_id)', table_name, table_name);
  
  RAISE NOTICE 'Tabela % criada com sucesso', table_name;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DADOS INICIAIS (Exemplos)
-- ============================================

-- Inserir categorias exemplo
INSERT INTO categorias (nome, descricao) VALUES
  ('Idle Arm', 'Braço de direção'),
  ('Drop Arm', 'Braço pitman'),
  ('Center', 'Braço central'),
  ('Thrust Bearing', 'Rolamento de empuxo')
ON CONFLICT (nome) DO NOTHING;

-- Inserir tipos exemplo
INSERT INTO tipos (codigo, descricao, categoria_id) VALUES
  ('AR', 'Tipo AR', (SELECT id FROM categorias WHERE nome = 'Idle Arm' LIMIT 1)),
  ('PQ', 'Tipo PQ', (SELECT id FROM categorias WHERE nome = 'Idle Arm' LIMIT 1)),
  ('FP', 'Tipo FP', (SELECT id FROM categorias WHERE nome = 'Idle Arm' LIMIT 1)),
  ('DR', 'Tipo DR', (SELECT id FROM categorias WHERE nome = 'Drop Arm' LIMIT 1)),
  ('CS', 'Tipo CS', (SELECT id FROM categorias WHERE nome = 'Center' LIMIT 1)),
  ('RB', 'Tipo RB', (SELECT id FROM categorias WHERE nome = 'Thrust Bearing' LIMIT 1))
ON CONFLICT (codigo) DO NOTHING;

-- Mensagem final
DO $$
BEGIN
  RAISE NOTICE '✅ Schema PartQuit criado com sucesso!';
  RAISE NOTICE '📊 Tabelas: categorias, tipos, fornecedores, pecas, compatibilidade_veiculos, abastecimentos, vendas_2026, vendas_2027';
  RAISE NOTICE '🔒 RLS habilitado em todas as tabelas';
  RAISE NOTICE '📝 Dados exemplo inseridos';
END $$;

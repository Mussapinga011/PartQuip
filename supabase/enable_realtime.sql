-- ============================================
-- HABILITAR REALTIME NO SUPABASE
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Habilitar a publicação para as tabelas principais
-- Isso permite que o Supabase envie eventos via WebSocket

-- Primeiro, limpamos se já existir (para evitar erros)
begin;
  -- Remove as tabelas da publicação se já estiverem lá
  alter publication supabase_realtime drop table if exists categorias;
  alter publication supabase_realtime drop table if exists tipos;
  alter publication supabase_realtime drop table if exists pecas;
  alter publication supabase_realtime drop table if exists fornecedores;
  alter publication supabase_realtime drop table if exists abastecimentos;
  alter publication supabase_realtime drop table if exists compatibilidade_veiculos;

  -- Adiciona as tabelas na publicação realtime
  alter publication supabase_realtime add table categorias;
  alter publication supabase_realtime add table tipos;
  alter publication supabase_realtime add table pecas;
  alter publication supabase_realtime add table fornecedores;
  alter publication supabase_realtime add table abastecimentos;
  alter publication supabase_realtime add table compatibilidade_veiculos;
commit;

-- 2. Habilitar para tabelas de vendas (anos específicos)
-- Você pode adicionar novos anos conforme necessário
alter publication supabase_realtime add table vendas_2025;
alter publication supabase_realtime add table vendas_2026;
alter publication supabase_realtime add table vendas_2027;

-- 3. Verificação
-- Esta query mostra quais tabelas estão com Realtime ativo
select * from pg_publication_tables where pubname = 'supabase_realtime';

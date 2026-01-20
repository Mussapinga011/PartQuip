-- ============================================
-- HABILITAR BUSCA AVANÇADA (FULL-TEXT SEARCH)
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Criar coluna de pesquisa gerada na tabela pecas
-- Esta coluna combina nome e código para uma busca super rápida
alter table pecas 
add column if not exists fts tsvector 
generated always as (
  to_tsvector('portuguese', coalesce(nome, '') || ' ' || coalesce(codigo, ''))
) stored;

-- 2. Criar índice para a busca
create index if not exists pecas_fts_idx on pecas using gin(fts);

-- 3. Função para busca fonética/fuzzy (precisa da extensão pg_trgm)
create extension if not exists pg_trgm;

-- 4. Índice de trigrama para busca por semelhança (fuzzy search)
create index if not exists pecas_nome_trgm_idx on pecas using gin (nome gin_trgm_ops);
create index if not exists pecas_codigo_trgm_idx on pecas using gin (codigo gin_trgm_ops);

-- 5. Função de busca dinâmica que combina tudo
create or replace function buscar_pecas_avancada(
  termo_busca text,
  cat_id uuid default null,
  forn_id uuid default null,
  preco_min numeric default null,
  preco_max numeric default null,
  so_estoque_baixo boolean default false
)
returns setof pecas
language sql
stable
as $$
  select *
  from pecas
  where 
    (termo_busca is null or termo_busca = '' or 
     fts @@ to_tsquery('portuguese', termo_busca || ':*') or 
     nome ilike '%' || termo_busca || '%' or 
     codigo ilike '%' || termo_busca || '%')
    and (cat_id is null or categoria_id = cat_id)
    and (forn_id is null or fornecedor_id = forn_id)
    and (preco_min is null or preco_venda >= preco_min)
    and (preco_max is null or preco_venda <= preco_max)
    and (not so_estoque_baixo or stock_atual < stock_minimo)
  order by 
    case 
      when termo_busca is not null and termo_busca <> '' then ts_rank(fts, to_tsquery('portuguese', termo_busca || ':*'))
      else 0 
    end desc,
    nome asc;
$$;

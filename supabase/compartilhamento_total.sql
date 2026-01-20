-- ============================================
-- MODELO DE COMPARTILHAMENTO TOTAL
-- Todos os usuários autenticados podem ver E editar tudo
-- Ideal para: Equipe pequena, confiança total
-- ============================================

-- ============================================
-- IMPORTANTE: LEIA ANTES DE EXECUTAR
-- ============================================
/*
Este script modifica as políticas RLS para permitir que:
✅ Todos os usuários autenticados possam LER todos os dados
✅ Todos os usuários autenticados possam CRIAR/EDITAR/DELETAR todos os dados

VANTAGENS:
- Colaboração total
- Sem barreiras entre usuários
- Qualquer um pode corrigir erros de outros
- Ideal para equipes pequenas e confiáveis

DESVANTAGENS:
- Sem isolamento de dados
- Usuário A pode deletar dados do Usuário B
- Sem rastreabilidade individual (mas user_id ainda é salvo)

Se você mudar de ideia, há um script de reversão no final.
*/

-- ============================================
-- PARTE 1: REMOVER POLÍTICAS ANTIGAS
-- ============================================

-- Categorias
DROP POLICY IF EXISTS "Usuários autenticados podem ler categorias" ON categorias;
DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias categorias" ON categorias;

-- Tipos
DROP POLICY IF EXISTS "Usuários autenticados podem ler tipos" ON tipos;
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios tipos" ON tipos;

-- Peças
DROP POLICY IF EXISTS "Usuários autenticados podem ler peças" ON pecas;
DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias peças" ON pecas;

-- Compatibilidade
DROP POLICY IF EXISTS "Usuários autenticados podem ler compatibilidade" ON compatibilidade_veiculos;
DROP POLICY IF EXISTS "Usuários podem gerenciar sua própria compatibilidade" ON compatibilidade_veiculos;

-- Fornecedores
DROP POLICY IF EXISTS "Usuários autenticados podem ler fornecedores" ON fornecedores;
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios fornecedores" ON fornecedores;

-- Abastecimentos
DROP POLICY IF EXISTS "Usuários autenticados podem ler abastecimentos" ON abastecimentos;
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios abastecimentos" ON abastecimentos;

-- Vendas (todas as tabelas)
DO $$ 
DECLARE
  tabela TEXT;
BEGIN
  FOR tabela IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_name LIKE 'vendas_%' 
      AND table_schema = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Usuários autenticados podem ler %s" ON %I', tabela, tabela);
    EXECUTE format('DROP POLICY IF EXISTS "Usuários podem gerenciar suas próprias %s" ON %I', tabela, tabela);
  END LOOP;
END $$;

-- ============================================
-- PARTE 2: CRIAR NOVAS POLÍTICAS (COMPARTILHAMENTO TOTAL)
-- ============================================

-- CATEGORIAS
CREATE POLICY "Todos podem acessar categorias"
ON categorias
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- TIPOS
CREATE POLICY "Todos podem acessar tipos"
ON tipos
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- PEÇAS
CREATE POLICY "Todos podem acessar peças"
ON pecas
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- COMPATIBILIDADE DE VEÍCULOS
CREATE POLICY "Todos podem acessar compatibilidade"
ON compatibilidade_veiculos
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- FORNECEDORES
CREATE POLICY "Todos podem acessar fornecedores"
ON fornecedores
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ABASTECIMENTOS
CREATE POLICY "Todos podem acessar abastecimentos"
ON abastecimentos
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- VENDAS (todas as tabelas)
DO $$ 
DECLARE
  tabela TEXT;
BEGIN
  FOR tabela IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_name LIKE 'vendas_%' 
      AND table_schema = 'public'
  LOOP
    EXECUTE format(
      'CREATE POLICY "Todos podem acessar %s" 
       ON %I 
       FOR ALL 
       TO authenticated 
       USING (true) 
       WITH CHECK (true)',
      tabela, tabela
    );
    RAISE NOTICE 'Política de compartilhamento total criada para %', tabela;
  END LOOP;
END $$;

-- ============================================
-- PARTE 3: VERIFICAÇÃO
-- ============================================

-- Verificar políticas criadas
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual = 'true' THEN '✅ Todos podem acessar'
    ELSE '❌ Restrito'
  END as tipo_acesso
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Resumo
SELECT 
  'Total de tabelas com RLS' as metrica,
  COUNT(DISTINCT tablename) as valor
FROM pg_policies
WHERE schemaname = 'public'

UNION ALL

SELECT 
  'Total de políticas',
  COUNT(*)
FROM pg_policies
WHERE schemaname = 'public'

UNION ALL

SELECT 
  'Políticas de compartilhamento total',
  COUNT(*)
FROM pg_policies
WHERE schemaname = 'public'
  AND qual = 'true'
  AND with_check = 'true';

-- ============================================
-- SUCESSO!
-- ============================================

/*
✅ CONFIGURAÇÃO CONCLUÍDA!

Agora todos os usuários autenticados podem:
- VER todos os dados
- CRIAR novos registros
- EDITAR qualquer registro
- DELETAR qualquer registro

NOTA IMPORTANTE:
- A coluna user_id ainda é preenchida automaticamente
- Você pode ver quem criou cada registro
- Mas qualquer usuário pode editar/deletar

TESTE:
1. Faça login com Usuário A
2. Crie uma peça
3. Faça login com Usuário B
4. Tente editar a peça do Usuário A
5. Deve funcionar! ✅
*/

-- ============================================
-- SCRIPT DE REVERSÃO (SE QUISER VOLTAR)
-- ============================================

/*
Se você quiser voltar ao modelo de isolamento (cada usuário edita apenas o seu),
execute o script: supabase/setup_completo.sql novamente.

Ou execute este bloco:

-- Remover políticas de compartilhamento total
DROP POLICY IF EXISTS "Todos podem acessar categorias" ON categorias;
DROP POLICY IF EXISTS "Todos podem acessar tipos" ON tipos;
DROP POLICY IF EXISTS "Todos podem acessar peças" ON pecas;
-- ... etc

-- Recriar políticas de isolamento
CREATE POLICY "Usuários podem gerenciar suas próprias categorias"
ON categorias FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
-- ... etc
*/

# PartQuit - Sistema de Gestão de Peças Automotivas

Sistema completo de gestão de peças automotivas com funcionalidade offline-first e sincronização em tempo real via Supabase.

## 🚀 Características

- ✅ **Offline-First**: Funciona sem internet, sincroniza quando online
- ✅ **PWA**: Instalável como aplicativo
- ✅ **Gestão Completa de Peças**: Cadastro, busca, filtros e alertas de stock
- ✅ **Sistema de Vendas**: Carrinho inteligente com validação de stock
- ✅ **Busca por Veículo**: Encontre peças compatíveis por marca/modelo/ano
- ✅ **Relatórios**: 6 tipos de relatórios e análises
- ✅ **Fornecedores**: Gestão completa com validação de CNPJ
- ✅ **Sincronização**: Dados sincronizados entre múltiplos dispositivos

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- Navegador moderno (Chrome, Firefox, Edge)

## 🔧 Instalação

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o script SQL em `supabase-schema.sql` no SQL Editor do Supabase
3. Copie a URL e Anon Key do projeto
4. Edite `src/lib/supabase.js` e adicione suas credenciais:

```javascript
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anon-aqui';
```

### 3. Executar em Desenvolvimento
```bash
npm run dev
```

Acesse: `http://localhost:5173`

### 4. Build para Produção
```bash
npm run build
npm run preview
```

## 📊 Inicializar Dados de Exemplo

Para testar o sistema com dados de exemplo:

1. Abra o console do navegador (F12)
2. Execute:
```javascript
import { initSampleData } from './src/init-sample-data.js';
initSampleData();
```

Isso criará:
- 4 categorias de peças
- 4 peças de exemplo
- 2 compatibilidades de veículos
- 1 fornecedor

## 🔐 Login

O sistema requer autenticação via Supabase. Para criar um usuário:

1. Acesse o Supabase Dashboard
2. Vá em Authentication → Users
3. Clique em "Add user"
4. Crie um usuário com email e senha
5. Use essas credenciais para fazer login no sistema

## 📱 Funcionalidades Principais

### Dashboard
- KPIs em tempo real (total de peças, valor em stock, vendas do dia)
- Top 5 peças mais vendidas
- Alertas de stock baixo

### Peças
- Cadastro completo com código, nome, categoria, preços e stock
- Busca e filtros avançados
- Alertas visuais de stock baixo
- Localização física no armazém

### Vendas
- Busca inteligente de peças
- Carrinho com controle de quantidade
- Validação automática de stock
- Geração de número de venda (V + YYYYMMDD + sequencial)
- Baixa automática de stock

### Busca por Veículo
- Seleção em cascata: Marca → Modelo → Ano
- Resultados agrupados por categoria
- Histórico das últimas 10 buscas
- Cadastro de compatibilidades

### Fornecedores
- Cadastro completo com CNPJ, telefone, email
- Validação automática de CNPJ
- Layout em cards responsivo

### Relatórios
1. Vendas por Período
2. Ranking de Peças Mais Vendidas
3. Peças com Stock Baixo
4. Vendas por Categoria
5. Análise de Margem de Lucro
6. Inventário Completo

## 🏗️ Estrutura do Projeto

```
PartQuip/
├── src/
│   ├── components/      # Componentes da aplicação
│   ├── lib/            # Bibliotecas (db, supabase, sync)
│   ├── utils/          # Utilitários e validações
│   ├── main.js         # Entry point
│   └── style.css       # Estilos Tailwind
├── index.html          # HTML principal
├── manifest.json       # PWA manifest
├── sw.js              # Service Worker
└── supabase-schema.sql # Schema do banco
```

## 🔄 Sincronização

O sistema funciona em modo offline-first:

1. **Offline**: Todas as operações são salvas no IndexedDB local
2. **Online**: Dados são sincronizados automaticamente com Supabase
3. **Conflitos**: Resolvidos por "last-write-wins" com timestamp

## 🧪 Testes

### Teste Offline
1. Abra DevTools → Network → Marque "Offline"
2. Cadastre uma peça
3. Registre uma venda
4. Desmarque "Offline"
5. Verifique sincronização automática

### Teste Multi-dispositivo
1. Abra o sistema em 2 navegadores
2. Cadastre uma peça no primeiro
3. Verifique aparecimento no segundo
4. Registre venda no segundo
5. Verifique baixa de stock no primeiro

## 📝 Próximos Passos

- [x] Implementar edição e exclusão de peças/fornecedores
- [x] Criar componente de abastecimento (entradas)
- [x] Implementar cancelamento de vendas
- [x] Adicionar impressão de recibos (PDF)
- [x] Implementar gráficos interativos (Chart.js)
- [x] Criar componente de hierarquia (Categoria → Tipo → Código)
- [x] Implementar abas anuais para vendas

## 🛠️ Tecnologias

- **Frontend**: Vite + Vanilla JavaScript
- **Styling**: Tailwind CSS
- **Database Local**: IndexedDB
- **Database Cloud**: Supabase (PostgreSQL)
- **PWA**: Service Worker + Manifest

## 📄 Licença

Este projeto é privado e de uso exclusivo.

## 👥 Suporte

Para dúvidas ou problemas, entre em contato com o desenvolvedor.

---

**Desenvolvido com ❤️ para gestão eficiente de peças automotivas**
git add .
git commit -m "Adicionado Modo Escuro e suporte a Inglês/Português"
git push origin main
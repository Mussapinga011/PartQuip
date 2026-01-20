# 🛠️ Comandos Úteis - PartQuip

Referência rápida de comandos para desenvolvimento, testes e manutenção.

---

## 📦 NPM / Desenvolvimento

### Instalação
```bash
# Instalar dependências
npm install

# Instalar dependência específica
npm install nome-do-pacote

# Instalar como dev dependency
npm install -D nome-do-pacote
```

### Desenvolvimento
```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build de produção
npm run preview

# Limpar cache e node_modules
rm -rf node_modules package-lock.json
npm install
```

---


## 🔍 Git

### Commits
```bash
# Status
git status

# Adicionar arquivos
git add .

# Commit
git commit -m "feat: descrição da feature"
git commit -m "fix: descrição do bug fix"
git commit -m "docs: atualização de documentação"

# Push
git push origin main
```

### Remover Arquivo do Git (mas manter local)
```bash
# Remover .env do histórico
git rm --cached .env

# Commit
git commit -m "chore: remove .env from git"
```

### Limpar Histórico de Credenciais
```bash
# CUIDADO: Reescreve o histórico!
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch src/lib/supabase.js" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (use com cuidado!)
git push origin --force --all
```

---

## 🧹 Limpeza e Manutenção

### Limpar Cache do Navegador
```javascript
// No console do navegador:

// Limpar Service Workers
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister());
});

// Limpar Cache Storage
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});

// Limpar IndexedDB
indexedDB.databases().then(dbs => {
  dbs.forEach(db => indexedDB.deleteDatabase(db.name));
});

// Limpar localStorage
localStorage.clear();

// Recarregar
location.reload();
```

### Limpar Build
```bash
# Windows
rmdir /s /q dist

# Linux/Mac
rm -rf dist
```


## 📊 Análise de Performance

### Lighthouse
```bash
# Via CLI (requer lighthouse instalado globalmente)
npm install -g lighthouse

# Executar análise
lighthouse http://localhost:3000 --view

# Análise PWA
lighthouse http://localhost:3000 --only-categories=pwa --view
```

### Bundle Analyzer
```bash
# Instalar
npm install -D rollup-plugin-visualizer

# Adicionar ao vite.config.js:
# import { visualizer } from 'rollup-plugin-visualizer';
# plugins: [..., visualizer()]

# Build
npm run build

# Abrir stats.html gerado
```

---

## 🔐 Segurança

### Verificar Variáveis de Ambiente
```bash
# Windows (PowerShell)
Get-Content .env

# Linux/Mac
cat .env

# Verificar se está no .gitignore
git check-ignore .env
# Deve retornar: .env
```

### Testar RLS
```javascript
// No console do navegador (após login):

// Tentar acessar dados de outro usuário
const { data, error } = await supabase
  .from('pecas')
  .select('*')
  .eq('user_id', 'outro-user-id');

console.log('Deve retornar vazio:', data);
console.log('Ou erro de RLS:', error);
```

---

## 📱 PWA

### Verificar Service Worker
```javascript
// No console do navegador:

// Ver status
navigator.serviceWorker.controller;

// Ver registrations
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs);
});

// Forçar atualização
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.update());
});
```

### Testar Instalação
```javascript
// Ver se pode ser instalado
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('App pode ser instalado!');
});

// Ver se já está instalado
window.matchMedia('(display-mode: standalone)').matches;
// true = instalado, false = navegador
```

---

## 🧪 Testes

### Testar Offline
```javascript
// Simular offline
window.dispatchEvent(new Event('offline'));

// Simular online
window.dispatchEvent(new Event('online'));

// Ver status
console.log('Online?', navigator.onLine);
```

### Testar Sincronização
```javascript
// Forçar sincronização (se usando sync-enhanced.js)
import { syncData } from './src/lib/sync-enhanced.js';
await syncData();
```

---

## 📝 Backup

### Backup do Banco de Dados
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Fazer backup
supabase db dump -f backup_$(date +%Y%m%d).sql

# Restaurar backup
supabase db push backup_20260120.sql
```

### Backup de Código
```bash
# Criar arquivo zip
# Windows (PowerShell)
Compress-Archive -Path . -DestinationPath ../partquip_backup_$(Get-Date -Format 'yyyyMMdd').zip

# Linux/Mac
tar -czf ../partquip_backup_$(date +%Y%m%d).tar.gz .
```

---

## 🚀 Deploy

### Build Otimizado
```bash
# Build
npm run build

# Verificar tamanho
du -sh dist/

# Preview local
npm run preview
```

### Deploy (exemplo com Vercel)
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
```

---

## 📞 Troubleshooting Rápido

### App não carrega
```bash
1. Verificar .env existe
2. Reiniciar servidor: Ctrl+C → npm run dev
3. Limpar cache: Ctrl+Shift+R
4. Verificar console: F12
```

### Sincronização não funciona
```bash
1. Verificar internet: ping google.com
2. Verificar Supabase: abrir dashboard
3. Verificar console: procurar erros de sync
4. Limpar localStorage e relogar
```

### RLS bloqueia tudo
```sql
1. Verificar políticas: SELECT * FROM pg_policies;
2. Verificar user_id: SELECT auth.uid();
3. Desabilitar temporariamente: ALTER TABLE x DISABLE ROW LEVEL SECURITY;
4. Recriar políticas: executar setup_completo.sql
```

### Service Worker não atualiza
```javascript
1. Desregistrar: navigator.serviceWorker.getRegistrations()...
2. Limpar cache: caches.keys()...
3. Hard reload: Ctrl+Shift+R
4. Rebuild: npm run build
```

---

**Última Atualização**: 2026-01-20  
**Versão**: 2.0.0

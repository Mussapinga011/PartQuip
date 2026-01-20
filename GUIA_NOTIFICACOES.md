# 🔔 Sistema de Notificações - Guia de Uso

Sistema completo de notificações de atividade para o PartQuip.

---

## ✅ O Que Foi Implementado

### Arquivos Criados:
1. **`src/lib/notifications.js`** - Sistema principal de notificações
2. **`src/components/notificationsPanel.js`** - Interface do painel
3. **`src/main.js`** - Integração (atualizado)

### Funcionalidades:
- ✅ Notificações toast (popup no canto superior direito)
- ✅ Painel de notificações com histórico
- ✅ Badge com contador de não lidas
- ✅ Sons de notificação (ativar/desativar)
- ✅ Marcar como lida/não lida
- ✅ Deletar notificações
- ✅ Limpar todas
- ✅ Armazenamento local (persist entre sessões)
- ✅ Animações suaves
- ✅ Suporte a tema escuro

---

## 🎯 Como Funciona

### 1. Notificação Toast (Popup)
Quando algo acontece, aparece um popup no canto superior direito:

```
┌─────────────────────────────┐
│ ✅ João vendeu 5x Filtro    │
│    Agora mesmo              │
└─────────────────────────────┘
```

- Aparece por 5 segundos
- Pode ser fechado manualmente
- Som opcional (bip)

### 2. Sino de Notificações
No header, ao lado do botão de logout:

```
🔔 (3)  ← Badge com contador
```

- Clique para abrir o painel
- Badge mostra quantas não lidas
- Badge desaparece quando todas são lidas

### 3. Painel de Notificações
Lista completa de todas as notificações:

```
┌─────────────────────────────────┐
│ Notificações          🔊 ✓ 🗑  │
├─────────────────────────────────┤
│ ✅ João vendeu 5x Filtro        │
│    2 min atrás              ✓ ✗│
├─────────────────────────────────┤
│ 🔵 Maria editou peça X          │
│    1h atrás                 ✓ ✗│
├─────────────────────────────────┤
│ ⚠️ Estoque baixo: Vela          │
│    Ontem                    ✓ ✗│
└─────────────────────────────────┘
```

**Controles:**
- 🔊 = Ativar/Desativar sons
- ✓ = Marcar todas como lidas
- 🗑 = Limpar todas

---

## 💻 Como Usar no Código

### Notificações Pré-Definidas

#### Quando criar uma peça:
```javascript
import { notifyPecaCreated } from '../lib/notifications.js';

// Após criar peça com sucesso
notifyPecaCreated(userName, pecaNome);
// Exibe: "João criou a peça 'Filtro de Óleo'"
```

#### Quando editar uma peça:
```javascript
import { notifyPecaUpdated } from '../lib/notifications.js';

notifyPecaUpdated(userName, pecaNome);
// Exibe: "Maria editou a peça 'Vela de Ignição'"
```

#### Quando deletar uma peça:
```javascript
import { notifyPecaDeleted } from '../lib/notifications.js';

notifyPecaDeleted(userName, pecaNome);
// Exibe: "Pedro deletou a peça 'Filtro de Ar'"
```

#### Quando fazer uma venda:
```javascript
import { notifyVendaCreated } from '../lib/notifications.js';

notifyVendaCreated(userName, quantidade, pecaNome);
// Exibe: "João vendeu 5x Filtro de Óleo"
```

#### Quando adicionar fornecedor:
```javascript
import { notifyFornecedorCreated } from '../lib/notifications.js';

notifyFornecedorCreated(userName, fornecedorNome);
// Exibe: "Maria adicionou o fornecedor 'Auto Peças XYZ'"
```

#### Alerta de estoque baixo:
```javascript
import { notifyEstoqueBaixo } from '../lib/notifications.js';

notifyEstoqueBaixo(pecaNome, estoque);
// Exibe: "⚠️ Estoque baixo: Filtro de Óleo (3 unidades)"
```

#### Sincronização concluída:
```javascript
import { notifySyncCompleted } from '../lib/notifications.js';

notifySyncCompleted();
// Exibe: "✅ Sincronização concluída com sucesso"
```

#### Erro na sincronização:
```javascript
import { notifySyncError } from '../lib/notifications.js';

notifySyncError(error.message);
// Exibe: "❌ Erro na sincronização: Network error"
```

---

### Notificações Personalizadas

```javascript
import { addNotification } from '../lib/notifications.js';

// Tipos: 'info', 'success', 'warning', 'error'

addNotification('success', 'Operação concluída!');
addNotification('warning', 'Atenção: Verifique os dados');
addNotification('error', 'Erro ao processar');
addNotification('info', 'Nova atualização disponível');

// Com dados extras
addNotification('success', 'Backup criado', {
  type: 'backup',
  fileName: 'backup_2026_01_20.sql'
});
```

---

## 🔧 Onde Adicionar as Notificações

### 1. No componente de Peças (`src/components/pecas.js`)

```javascript
import { notifyPecaCreated, notifyPecaUpdated, notifyPecaDeleted } from '../lib/notifications.js';
import { supabaseHelpers } from '../lib/supabase.js';

// Ao criar peça
async function criarPeca(dados) {
  try {
    const peca = await supabaseHelpers.insert('pecas', dados);
    
    // ADICIONAR AQUI:
    const userName = currentUser.email.split('@')[0];
    notifyPecaCreated(userName, dados.nome);
    
    showToast('Peça criada com sucesso!', 'success');
  } catch (error) {
    showToast('Erro ao criar peça', 'error');
  }
}

// Ao editar peça
async function editarPeca(id, dados) {
  try {
    await supabaseHelpers.update('pecas', id, dados);
    
    // ADICIONAR AQUI:
    const userName = currentUser.email.split('@')[0];
    notifyPecaUpdated(userName, dados.nome);
    
    showToast('Peça atualizada!', 'success');
  } catch (error) {
    showToast('Erro ao atualizar', 'error');
  }
}

// Ao deletar peça
async function deletarPeca(id, nome) {
  try {
    await supabaseHelpers.delete('pecas', id);
    
    // ADICIONAR AQUI:
    const userName = currentUser.email.split('@')[0];
    notifyPecaDeleted(userName, nome);
    
    showToast('Peça deletada!', 'success');
  } catch (error) {
    showToast('Erro ao deletar', 'error');
  }
}
```

### 2. No componente de Vendas (`src/components/vendas.js`)

```javascript
import { notifyVendaCreated, notifyEstoqueBaixo } from '../lib/notifications.js';

// Ao criar venda
async function criarVenda(dados) {
  try {
    await supabaseHelpers.insert('vendas', dados);
    
    // ADICIONAR AQUI:
    const userName = currentUser.email.split('@')[0];
    notifyVendaCreated(userName, dados.quantidade, dados.peca_nome);
    
    // Verificar estoque baixo
    const peca = await supabaseHelpers.getById('pecas', dados.peca_id);
    if (peca.estoque < 10) {
      notifyEstoqueBaixo(peca.nome, peca.estoque);
    }
    
    showToast('Venda registrada!', 'success');
  } catch (error) {
    showToast('Erro ao registrar venda', 'error');
  }
}
```

### 3. No sistema de sincronização (`src/lib/sync.js`)

```javascript
import { notifySyncCompleted, notifySyncError } from './notifications.js';

export async function syncData() {
  try {
    // ... código de sincronização ...
    
    console.log('✅ Sync completed successfully');
    
    // ADICIONAR AQUI:
    notifySyncCompleted();
    
  } catch (error) {
    console.error('Sync error:', error);
    
    // ADICIONAR AQUI:
    notifySyncError(error.message);
  }
}
```

---

## 🎨 Personalização

### Mudar Duração do Toast
Em `src/lib/notifications.js`, linha ~80:

```javascript
// De 5 segundos para 3 segundos
setTimeout(() => {
  toast.classList.add('animate-slide-out');
  setTimeout(() => toast.remove(), 300);
}, 3000); // ← Altere aqui (em milissegundos)
```

### Mudar Limite de Notificações
Em `src/lib/notifications.js`, linha ~6:

```javascript
const MAX_NOTIFICATIONS = 100; // ← Altere aqui
```

### Desabilitar Sons por Padrão
Em `src/lib/notifications.js`, linha ~105:

```javascript
const soundsEnabled = localStorage.getItem('partquit_notification_sounds') !== 'true'; // ← Inverta a lógica
```

---

## 📱 Testes

### Teste 1: Notificação Toast
1. Abra o console do navegador
2. Execute:
```javascript
import { addNotification } from './src/lib/notifications.js';
addNotification('success', 'Teste de notificação!');
```
3. Deve aparecer um toast no canto superior direito

### Teste 2: Painel de Notificações
1. Faça login
2. Clique no sino (🔔) no header
3. Painel deve abrir
4. Teste os botões de controle

### Teste 3: Badge
1. Crie algumas notificações
2. Badge deve mostrar o número
3. Marque como lida
4. Badge deve atualizar

### Teste 4: Sons
1. Clique no botão de som no painel
2. Crie uma notificação
3. Deve tocar um bip
4. Desative e teste novamente

---

## 🐛 Troubleshooting

### Notificações não aparecem
- Verifique se `initNotifications()` está sendo chamado no `main.js`
- Verifique o console para erros
- Limpe o localStorage: `localStorage.clear()`

### Sino não aparece
- Verifique se `initNotificationsPanel()` está sendo chamado
- Verifique se o header existe no HTML
- Verifique se o botão de logout existe

### Sons não funcionam
- Alguns navegadores bloqueiam áudio automático
- Usuário precisa interagir com a página primeiro
- Verifique se sons estão habilitados no painel

---

## 🚀 Próximas Melhorias

Possíveis melhorias futuras:

1. **Notificações Push** (requer service worker)
2. **Filtros** (por tipo, data, lido/não lido)
3. **Busca** nas notificações
4. **Exportar** histórico
5. **Notificações agendadas**
6. **Prioridades** (alta, média, baixa)
7. **Ações rápidas** (responder, arquivar)

---

## ✅ Checklist de Implementação

- [x] Sistema de notificações criado
- [x] Painel de notificações criado
- [x] Integração no main.js
- [ ] Adicionar notificações no componente de peças
- [ ] Adicionar notificações no componente de vendas
- [ ] Adicionar notificações no componente de fornecedores
- [ ] Adicionar notificações na sincronização
- [ ] Testar com múltiplos usuários
- [ ] Ajustar traduções (i18n)

---

**Data de Implementação:** 2026-01-20  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para uso

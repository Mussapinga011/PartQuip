import { supabase } from './supabase.js';
import { dbOperations } from './db.js';
import { addNotification } from './notifications.js';
import { setRealtimeStatus } from './sync.js';

let channel = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;

/**
 * Initialize Real-time Subscriptions
 * Listens for changes on Supabase and updates the local IndexedDB immediately.
 */
export function initRealtime(onDataChange) {
  // If already subscribed, don't do it again
  if (channel) return;

  console.log('📡 Initializing Real-time Subscriptions...');

  // Subscribe to all changes in the 'public' schema
  // We filter specific tables that we want to track
  channel = supabase
    .channel('public_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public' },
      handleRealtimeUpdate
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Real-time Subscriptions active');
        setRealtimeStatus(true);
        reconnectAttempts = 0; // Reset on success
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Real-time subscription error:', err);
        setRealtimeStatus(false);
        
        // Retry logic
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          console.log(`🔄 Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
          setTimeout(() => {
            stopRealtime();
            initRealtime(onDataChange);
          }, 2000 * reconnectAttempts);
        } else {
          console.error('❌ Max reconnect attempts reached. Realtime disabled.');
          addNotification('warning', 'Sincronização em tempo real desativada. Os dados serão atualizados periodicamente.');
        }
      } else if (status === 'SUBSCRIBED') {
        // Optional: show a small toast or just log
        console.log('✅ Real-time Subscriptions active');
      }
    });

  // Function to handle incoming database events
  async function handleRealtimeUpdate(payload) {
    const { eventType, table, new: newRecord, old: oldRecord } = payload;
    
    console.log(`[Realtime Event] ${eventType} on ${table}`, payload);

    let storeName = table;
    
    try {
      switch (eventType) {
        case 'INSERT':
        case 'UPDATE':
          await dbOperations.put(storeName, newRecord);
          if (onDataChange) onDataChange(storeName, eventType, newRecord);
          // NEW: Ensure we ALWAYS try to notify, even if it's a minimal record
          notifyActivity(storeName, eventType, newRecord);
          break;

        case 'DELETE':
          await dbOperations.delete(storeName, oldRecord.id);
          if (onDataChange) onDataChange(storeName, eventType, oldRecord);
          break;
      }

      window.dispatchEvent(new CustomEvent('dataChanged', { 
        detail: { storeName, eventType, record: newRecord || oldRecord } 
      }));

    } catch (error) {
      console.error('[Realtime] Error processing update:', error);
    }
  }
}

/**
 * Utility to notify user of remote changes
 */
function notifyActivity(store, event, record) {
  // Defensive check
  if (!record) return;

  const pecaNome = record.nome || record.peca_nome || '';
  const codigo = record.codigo || record.peca_codigo || '';
  const identificador = codigo ? `${codigo} - ${pecaNome}` : pecaNome;

  // IMPORTANT: Supabase Realtime packet might not include all columns 
  // if Full Replica Identity is not set. We'll show what we have.
  
  if (store === 'vendas' && event === 'INSERT') {
    addNotification('success', `Nova venda: ${record.quantidade || 1}x ${identificador || 'Item'}`);
  } else if (store === 'pecas' && event === 'UPDATE') {
    addNotification('info', `Peça modificada: ${identificador}`);
    
    // Low Stock Alert
    if (record.stock_atual !== undefined && record.stock_minimo !== undefined) {
      if (record.stock_atual < record.stock_minimo) {
        addNotification('warning', `⚠️ Estoque baixo: ${identificador} (${record.stock_atual})`);
      }
    }
  } else if (store === 'pecas' && event === 'INSERT') {
    addNotification('success', `Nova peça: ${identificador}`);
  } else if (store === 'fornecedores' && event === 'INSERT') {
    addNotification('success', `Novo fornecedor: ${record.nome || 'Registrado'}`);
  } else if (store === 'abastecimentos' && event === 'INSERT') {
    addNotification('success', `Estoque reforçado: +${record.quantidade || 0}x ${identificador}`);
  }
}

/**
 * Stop Real-time Subscriptions
 */
export function stopRealtime() {
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
    console.log('📡 Real-time Subscriptions stopped');
  }
}

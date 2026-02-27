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
          }, 2000 * reconnectAttempts); // Exponential backoff
        } else {
          console.error('❌ Max reconnect attempts reached. Realtime disabled.');
          addNotification('warning', 'Sincronização em tempo real desativada. Os dados serão atualizados periodicamente.');
        }
      } else if (status === 'CLOSED') {
        console.log('📡 Real-time connection closed');
        setRealtimeStatus(false);
      }
    });

  // Function to handle incoming database events
  async function handleRealtimeUpdate(payload) {
    const { eventType, table, new: newRecord, old: oldRecord } = payload;
    
    // Vendas table is now unified (no more yearly partitions)
    let storeName = table;

    // 2. We skip updates that we triggered ourselves (simplified logic)
    // In a production app, we would use a local source ID to ignore our own updates
    
    try {
      switch (eventType) {
        case 'INSERT':
        case 'UPDATE':
          // Upsert into IndexedDB
          await dbOperations.put(storeName, newRecord);
          console.log(`[Realtime] ${eventType} in ${table}:`, newRecord.id);
          
          // Trigger UI update if callback exists
          if (onDataChange) onDataChange(storeName, eventType, newRecord);
          
          // Show non-intrusive notification for certain tables
          notifyActivity(storeName, eventType, newRecord);
          break;

        case 'DELETE':
          // Remove from IndexedDB
          await dbOperations.delete(storeName, oldRecord.id);
          console.log(`[Realtime] DELETE in ${table}:`, oldRecord.id);
          
          // Trigger UI update
          if (onDataChange) onDataChange(storeName, eventType, oldRecord);
          break;
      }

      // Dispatch a global event so any component can listen for data changes
      window.dispatchEvent(new CustomEvent('dataChanged', { 
        detail: { storeName, eventType, record: newRecord || oldRecord } 
      }));

    } catch (error) {
      console.error('[Realtime] Error processing update:', error);
      console.error('[Realtime] Failed payload:', { eventType, table, newRecord, oldRecord });
    }
  }
}

/**
 * Utility to notify user of remote changes
 */
function notifyActivity(store, event, record) {
  // We only notify for important changes
  const pecaNome = record.nome || record.peca_nome || 'Item';
  const codigo = record.codigo || record.peca_codigo || '';

  if (store === 'vendas' && event === 'INSERT') {
    addNotification('success', `Nova venda registrada: ${record.quantidade}x ${pecaNome}`);
  } else if (store === 'pecas' && event === 'UPDATE') {
    addNotification('info', `Peça atualizada: ${codigo} - ${pecaNome}`);
    
    // Global Low Stock Alert
    if (record.stock_atual < record.stock_minimo) {
      addNotification('warning', `⚠️ Estoque baixo: ${pecaNome} (${record.stock_atual} unidades)`);
    }
  } else if (store === 'pecas' && event === 'INSERT') {
    addNotification('success', `Nova peça cadastrada: ${codigo} - ${pecaNome}`);
  } else if (store === 'fornecedores' && event === 'INSERT') {
    addNotification('success', `Novo fornecedor: ${record.nome}`);
  } else if (store === 'abastecimentos' && event === 'INSERT') {
    addNotification('success', `Entrada de estoque: +${record.quantidade}x ${pecaNome}`);
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

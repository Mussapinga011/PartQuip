// Real-time Data Synchronization Layer
// Extends the sync-enhanced.js with live updates from Supabase Realtime

import { supabase } from './supabase.js';
import { dbOperations } from './db.js';
import { addNotification } from './notifications.js';

let channel = null;

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
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Real-time Subscriptions active');
      }
    });

  // Function to handle incoming database events
  async function handleRealtimeUpdate(payload) {
    const { eventType, table, new: newRecord, old: oldRecord } = payload;
    
    // 1. Determine local store name
    // Vendas tables are partitioned by year (vendas_2025, vendas_2026, etc.)
    // but locally they are all in the 'vendas' store.
    let storeName = table;
    if (table.startsWith('vendas_')) {
      storeName = 'vendas';
    }

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
          // notifyActivity(storeName, eventType, newRecord);
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
    }
  }
}

/**
 * Utility to notify user of remote changes
 */
/*
function notifyActivity(store, event, record) {
  // We only notify for important changes from OTHER users
  // (Assuming we might filter by user_id here)
  
  if (store === 'vendas' && event === 'INSERT') {
    addNotification('success', `Nova venda registrada em tempo real: ${record.quantidade} unidades.`);
  } else if (store === 'pecas' && event === 'UPDATE') {
    addNotification('info', `Estoque da peça ${record.codigo} foi atualizado remotamente.`);
  }
}
*/

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

// Synchronization Engine - Quota-Optimized for Free Tier
import { supabase, supabaseHelpers } from './supabase.js';
import { dbOperations, syncQueue } from './db.js';
import { notifySyncError } from './notifications.js';

let isOnline = navigator.onLine;
let isSyncing = false;
let syncInterval = null;
let realtimeActive = false; // Track if realtime is working


// Check if a table is empty in IndexedDB
async function isTableEmpty(tableName) {
  try {
    const data = await dbOperations.getAll(tableName);
    return !data || data.length === 0;
  } catch (error) {
    console.error(`Error checking if ${tableName} is empty:`, error);
    return true; // Assume empty on error to trigger sync
  }
}

// Check if any critical table is empty
// ALWAYS checks tables, regardless of first sync flag
async function needsFullSync() {
  // Check if any critical table is empty
  const criticalTables = ['categorias', 'tipos', 'pecas', 'fornecedores'];
  
  for (const table of criticalTables) {
    if (await isTableEmpty(table)) {
      console.log(`🔄 Table ${table} is empty - will perform full sync`);
      return true;
    }
  }
  
  console.log('✅ All critical tables have data - no full sync needed');
  return false;
}

// Update online status
export function updateOnlineStatus() {
  isOnline = navigator.onLine;
  updateSyncStatusUI();
  
  if (isOnline && !isSyncing) {
    syncData(false); // Upload only when status changes
  }
}

// Update sync status UI
function updateSyncStatusUI() {
  const statusEl = document.getElementById('sync-status');
  if (!statusEl) return;

  if (isSyncing) {
    statusEl.className = 'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-100';
    statusEl.innerHTML = `
      <svg class="w-4 h-4 text-yellow-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
      </svg>
      <span class="text-sm font-medium text-yellow-600">Sincronizando...</span>
    `;
  } else if (isOnline) {
    statusEl.className = 'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-100';
    statusEl.innerHTML = `
      <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span class="text-sm font-medium text-green-600">Online</span>
    `;
  } else {
    statusEl.className = 'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-100';
    statusEl.innerHTML = `
      <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"></path>
      </svg>
      <span class="text-sm font-medium text-red-600">Offline</span>
    `;
  }
}

// Mark realtime as active (called from realtime.js)
export function setRealtimeStatus(active) {
  realtimeActive = active;
  console.log(`📡 Realtime status: ${active ? 'ACTIVE' : 'INACTIVE'}`);
}

// Sync data between IndexedDB and Supabase
// fullSync: true = download all data (quota-heavy, only on startup or reconnect)
// fullSync: false = upload pending changes only (quota-light, frequent)
// If fullSync is false but tables are empty, it will auto-upgrade to full sync
export async function syncData(fullSync = false) {
  if (!isOnline || isSyncing) return;

  isSyncing = true;
  updateSyncStatusUI();
  
  // Smart sync: check if we need full sync even if not requested
  if (!fullSync) {
    const needsFull = await needsFullSync();
    if (needsFull) {
      console.log('⚠️ Auto-upgrading to full sync because tables are empty');
      fullSync = true;
    }
  }

  try {
    // 1. UPLOAD: Process sync queue (upload local changes) - ALWAYS DO THIS
    const queue = await syncQueue.getAll();
    const pending = queue.filter(item => !item.synced);

    if (pending.length > 0) {
      console.log(`📤 Uploading ${pending.length} pending changes...`);
    }

    for (const item of pending) {
      try {
        let tableName = item.table;
        let data = { ...item.data };

        // Handle annual vendas tables mapping - REMOVED (Unified DB)
        // if (tableName === 'vendas') {
        //   const year = new Date(data.created_at).getFullYear() || new Date().getFullYear();
        //   tableName = `vendas_${year}`;
        // }

        // Handle legacy column name mapping for abastecimentos if present in queue
        if (tableName === 'abastecimentos' && data.custo_unitario !== undefined) {
          data.valor_unitario = data.custo_unitario;
          delete data.custo_unitario;
        }

        // Handle legacy column name mapping for old sales items in queue
        if (tableName.startsWith('vendas_')) {
          if (data.cliente !== undefined) {
            data.cliente_veiculo = data.cliente;
            delete data.cliente;
          }
        }

        // Remove generated columns from data before syncing
        if (tableName === 'vendas' || tableName.startsWith('vendas_') || tableName === 'abastecimentos') {
          delete data.total;
        }
        
        // Remove 'fts' (full-text search) if it exists - it's a generated column
        if (data.fts !== undefined) {
          delete data.fts;
        }

        switch (item.operation) {
          case 'insert':
            await supabaseHelpers.insert(tableName, data);
            break;
          case 'update':
            // Conflict Resolution: Check if server has newer data
            // Get current server version
            const { data: serverRecord, error: fetchError } = await supabase
              .from(tableName)
              .select('updated_at')
              .eq('id', data.id)
              .single();

            if (!fetchError && serverRecord && serverRecord.updated_at) {
              const serverTime = new Date(serverRecord.updated_at).getTime();
              const localEditTime = new Date(item.timestamp).getTime();

              // If server data is newer than our local edit time (tolerance 1000ms)
              if (serverTime > localEditTime + 1000) {
                console.warn(`⚔️ Conflict detected for ${tableName} ID ${data.id}: Server is newer. Skipping overwrite.`);
                console.warn(`Server: ${new Date(serverTime).toISOString()} vs Local Edit: ${new Date(localEditTime).toISOString()}`);
                // Skip update, mark as synced to remove from queue
                // Ideally we should notify user, but for now we prioritize server integrity
                break; 
              }
            }

            await supabaseHelpers.update(tableName, data.id, data);
            break;
          case 'delete':
            await supabaseHelpers.delete(tableName, data.id);
            break;
        }
        await syncQueue.markSynced(item.id);
      } catch (error) {
        const errorMsg = error.message || (typeof error === 'string' ? error : 'Erro desconhecido');
        console.error(`Sync error for ${item.table} (${item.operation}):`, errorMsg, error.details || '');
        
        // Mostrar erro ao usuário se for uma operação importante
        if (item.operation === 'update' || item.operation === 'insert') {
          console.warn(`⚠️ Falha ao sincronizar ${item.table}: ${errorMsg}`);
        }
      }
    }

    // 2. DOWNLOAD: Full data sync - ONLY when explicitly requested
    // This is quota-heavy, so we only do it:
    // - On initial app load (fullSync=true from initSync)
    // - When coming back online after being offline
    // - When realtime connection fails
    // During normal operation, we rely 100% on Realtime subscriptions
    if (fullSync) {
      console.log('📥 Performing full data download (quota-heavy operation)...');
      
      const tables = ['categorias', 'tipos', 'pecas', 'compatibilidade_veiculos', 
                      'fornecedores', 'abastecimentos'];
      
      for (const table of tables) {
        try {
          const remoteData = await supabaseHelpers.getAll(table);
          
          // Clear local store and replace with remote data
          await dbOperations.clear(table);
          for (const item of remoteData) {
            await dbOperations.add(table, item);
          }
        } catch (error) {
          console.error(`Sync error for table ${table}:`, error);
        }
      }

      // Sync vendas (unified)
      const vendasTable = 'vendas';
      try {
        const { data: vendas, error } = await supabase
          .from(vendasTable)
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && vendas) {
          await dbOperations.clear('vendas');
          for (const venda of vendas) {
            await dbOperations.add('vendas', venda);
          }
        }
      } catch (error) {
        console.error('Sync error for vendas:', error);
      }
      
      console.log('✅ Full sync completed - all data downloaded');
    } else if (pending.length > 0) {
      console.log('✅ Upload sync completed');
    } else {
      console.log('✅ Sync check completed - no changes needed');
    }

    // Clean up synced items
    await syncQueue.clearSynced();

  } catch (error) {
    notifySyncError(error.message || error);
    console.error('Sync error:', error);
  } finally {
    isSyncing = false;
    updateSyncStatusUI();
  }
}

// Initialize sync with quota-friendly strategy
export function initSync() {
  // Listen to online/offline events
  window.addEventListener('online', () => {
    updateOnlineStatus();
    // When coming back online, do a full sync to catch up
    console.log('🌐 Connection restored, performing full sync...');
    syncData(true);
  });
  
  window.addEventListener('offline', updateOnlineStatus);
  
  // Listen for manual sync triggers from db operations
  // This only uploads changes immediately (quota-light)
  window.addEventListener('triggerSync', () => {
    if (isOnline && !isSyncing) {
      syncData(false); // Upload only, no download
    }
  });

  // Initial status update
  updateOnlineStatus();

  // Periodic sync every 30 minutes - UPLOAD ONLY
  // We rely on Realtime for downloads, this is just a safety net for pending uploads
  // This is extremely quota-friendly as it only sends data, doesn't download
  syncInterval = setInterval(() => {
    if (isOnline && !isSyncing) {
      syncData(false); // Upload only, no download
    }
  }, 1800000); // 30 minutes

  // Initial full sync on app load (one-time quota cost)
  if (isOnline) {
    console.log('🚀 Initial app load, performing full sync...');
    syncData(true); // Full sync on startup
  }
}

// Force a full sync manually (called by user button)
export async function forceFullSync() {
  if (!isOnline) {
    console.warn('⚠️ Cannot sync - device is offline');
    return { success: false, message: 'Dispositivo offline. Conecte-se à internet para sincronizar.' };
  }
  
  if (isSyncing) {
    console.warn('⚠️ Sync already in progress');
    return { success: false, message: 'Sincronização já em andamento. Aguarde...' };
  }
  
  console.log('🔄 Manual full sync triggered by user');
  await syncData(true); // Force full sync
  return { success: true, message: 'Sincronização completa realizada com sucesso!' };
}

// Stop sync
export function stopSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
}

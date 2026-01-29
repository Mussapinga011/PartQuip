// Enhanced Synchronization Engine with Delta Sync
import { supabase, supabaseHelpers } from './supabase.js';
import { dbOperations, syncQueue } from './db.js';

let isOnline = navigator.onLine;
let isSyncing = false;
let syncInterval = null;

// Store last sync timestamps for each table
const lastSyncTimestamps = {
  categorias: null,
  tipos: null,
  pecas: null,
  compatibilidade_veiculos: null,
  fornecedores: null,
  abastecimentos: null,
  vendas: null
};

// Load last sync timestamps from localStorage
function loadSyncTimestamps() {
  const stored = localStorage.getItem('partquit_last_sync');
  if (stored) {
    try {
      Object.assign(lastSyncTimestamps, JSON.parse(stored));
    } catch (e) {
      console.error('Error loading sync timestamps:', e);
    }
  }
}

// Save sync timestamps to localStorage
function saveSyncTimestamps() {
  localStorage.setItem('partquit_last_sync', JSON.stringify(lastSyncTimestamps));
}

// Update online status
export function updateOnlineStatus() {
  isOnline = navigator.onLine;
  updateSyncStatusUI();
  
  if (isOnline && !isSyncing) {
    syncData();
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

// Process sale with server-side stock validation (RPC)
export async function processSaleWithValidation(saleData) {
  if (!isOnline) {
    // Offline: add to queue for later processing
    await syncQueue.add('vendas', 'insert', saleData);
    return { success: true, offline: true };
  }

  try {
    // Call Supabase RPC function to process sale with stock validation
    const { data, error } = await supabase.rpc('process_sale', {
      sale_data: saleData
    });

    if (error) throw error;
    
    return { success: true, data, offline: false };
  } catch (error) {
    console.error('Error processing sale:', error);
    
    // If network error, fallback to offline mode
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      await syncQueue.add('vendas', 'insert', saleData);
      return { success: true, offline: true };
    }
    
    throw error;
  }
}

// Delta sync: only sync changed records based on updated_at timestamp
async function deltaSyncTable(table) {
  const lastSync = lastSyncTimestamps[table];
  
  try {
    let query = supabase
      .from(table)
      .select('*')
      .order('updated_at', { ascending: false });
    
    // Only fetch records updated after last sync
    if (lastSync) {
      query = query.gt('updated_at', lastSync);
    }
    
    const { data: remoteData, error } = await query;
    
    if (error) throw error;
    
    if (!remoteData || remoteData.length === 0) {
      console.log(`No changes for ${table}`);
      return;
    }
    
    console.log(`Syncing ${remoteData.length} changed records for ${table}`);
    
    // Get all local records for comparison
    const localData = await dbOperations.getAll(table);
    const localMap = new Map(localData.map(item => [item.id, item]));
    
    // Merge remote changes with local data
    for (const remoteItem of remoteData) {
      const localItem = localMap.get(remoteItem.id);
      
      if (!localItem) {
        // New record from server
        await dbOperations.add(table, remoteItem);
      } else {
        // Conflict resolution: use the most recent updated_at
        const remoteTime = new Date(remoteItem.updated_at).getTime();
        const localTime = new Date(localItem.updated_at || localItem.created_at).getTime();
        
        if (remoteTime > localTime) {
          // Server version is newer
          await dbOperations.update(table, remoteItem.id, remoteItem);
        } else if (localTime > remoteTime) {
          // Local version is newer - push to server
          await supabaseHelpers.update(table, remoteItem.id, localItem);
        }
        // If equal, no action needed
      }
    }
    
    // Update last sync timestamp
    if (remoteData.length > 0) {
      lastSyncTimestamps[table] = new Date().toISOString();
      saveSyncTimestamps();
    }
    
  } catch (error) {
    console.error(`Delta sync error for table ${table}:`, error);
    throw error;
  }
}

// Sync data between IndexedDB and Supabase
export async function syncData() {
  if (!isOnline || isSyncing) return;

  isSyncing = true;
  updateSyncStatusUI();

  try {
    // 1. Process sync queue (upload local changes)
    const queue = await syncQueue.getAll();
    const pending = queue.filter(item => !item.synced);

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

        // Remove 'total' from data if it's a generated column in Supabase (vendas, abastecimentos)
        if (tableName.startsWith('vendas_') || tableName === 'abastecimentos') {
          delete data.total;
        }

        // Add updated_at timestamp
        data.updated_at = new Date().toISOString();

        switch (item.operation) {
          case 'insert':
            await supabaseHelpers.insert(tableName, data);
            break;
          case 'update':
            await supabaseHelpers.update(tableName, data.id, data);
            break;
          case 'delete':
            await supabaseHelpers.delete(tableName, data.id);
            break;
        }
        await syncQueue.markSynced(item.id);
      } catch (error) {
        console.error('Sync error for item:', item, error);
        // Don't throw - continue with other items
      }
    }

    // 2. Delta sync for all tables
    const tables = ['categorias', 'tipos', 'pecas', 'compatibilidade_veiculos', 
                    'fornecedores', 'abastecimentos'];
    
    for (const table of tables) {
      try {
        await deltaSyncTable(table);
      } catch (error) {
        console.error(`Sync error for table ${table}:`, error);
        // Continue with other tables
      }
    }

    // 3. Sync vendas (unified) with delta sync
    const vendasTable = 'vendas';
    constlastVendasSync = lastSyncTimestamps.vendas;
    
    try {
      let query = supabase
        .from(vendasTable)
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (lastVendasSync) {
        query = query.gt('updated_at', lastVendasSync);
      }
      
      const { data: vendas, error } = await query;
      
      if (!error && vendas && vendas.length > 0) {
        const localVendas = await dbOperations.getAll('vendas');
        const localMap = new Map(localVendas.map(v => [v.id, v]));
        
        for (const venda of vendas) {
          const localVenda = localMap.get(venda.id);
          
          if (!localVenda) {
            await dbOperations.add('vendas', venda);
          } else {
            const remoteTime = new Date(venda.updated_at).getTime();
            const localTime = new Date(localVenda.updated_at || localVenda.created_at).getTime();
            
            if (remoteTime > localTime) {
              await dbOperations.update('vendas', venda.id, venda);
            }
          }
        }
        
        lastSyncTimestamps.vendas = new Date().toISOString();
        saveSyncTimestamps();
      }
    } catch (error) {
      console.error('Sync error for vendas:', error);
    }

    // 4. Clean up synced items
    await syncQueue.clearSynced();

    console.log('✅ Sync completed successfully');
  } catch (error) {
    console.error('Sync error:', error);
  } finally {
    isSyncing = false;
    updateSyncStatusUI();
  }
}

// Initialize sync
export function initSync() {
  // Load last sync timestamps
  loadSyncTimestamps();
  
  // Listen to online/offline events
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  // Initial status update
  updateOnlineStatus();

  // Periodic sync every 5 minutes when online
  syncInterval = setInterval(() => {
    if (isOnline && !isSyncing) {
      syncData();
    }
  }, 300000);

  // Initial sync
  if (isOnline) {
    syncData();
  }
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

// IndexedDB Configuration and Operations
const DB_NAME = 'PartQuitDB';
const DB_VERSION = 1;

let db = null;

// Initialize IndexedDB
export async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object stores
      const stores = [
        { name: 'categorias', keyPath: 'id', indexes: ['nome'] },
        { name: 'tipos', keyPath: 'id', indexes: ['codigo', 'categoria_id'] },
        { name: 'pecas', keyPath: 'id', indexes: ['codigo', 'categoria_id', 'tipo_id'] },
        { name: 'compatibilidade_veiculos', keyPath: 'id', indexes: ['marca', 'modelo'] },
        { name: 'fornecedores', keyPath: 'id', indexes: ['nome'] },
        { name: 'abastecimentos', keyPath: 'id', indexes: ['peca_id', 'created_at'] },
        { name: 'vendas', keyPath: 'id', indexes: ['peca_id', 'created_at'] },
        { name: 'sync_queue', keyPath: 'id', autoIncrement: true }
      ];

      stores.forEach(({ name, keyPath, indexes, autoIncrement }) => {
        if (!db.objectStoreNames.contains(name)) {
          const objectStore = db.createObjectStore(name, { 
            keyPath, 
            autoIncrement: autoIncrement || false 
          });
          
          if (indexes) {
            indexes.forEach(index => {
              objectStore.createIndex(index, index, { unique: false });
            });
          }
        }
      });
    };
  });
}

// Generic CRUD operations
export const dbOperations = {
  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getById(storeName, id) {
    if (!id) return null;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async add(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async put(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async delete(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async clear(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
};

// Sync queue operations
export const syncQueue = {
  async add(operation, table, data) {
    const result = await dbOperations.add('sync_queue', {
      operation, // 'insert', 'update', 'delete'
      table,
      data,
      timestamp: new Date().toISOString(),
      synced: false
    });
    
    // Trigger immediate sync
    window.dispatchEvent(new CustomEvent('triggerSync'));
    
    return result;
  },

  async getAll() {
    return dbOperations.getAll('sync_queue');
  },

  async markSynced(id) {
    const item = await dbOperations.getById('sync_queue', id);
    if (item) {
      item.synced = true;
      await dbOperations.put('sync_queue', item);
    }
  },

  async clearSynced() {
    const all = await this.getAll();
    const synced = all.filter(item => item.synced);
    for (const item of synced) {
      await dbOperations.delete('sync_queue', item.id);
    }
  }
};

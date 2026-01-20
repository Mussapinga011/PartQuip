/**
 * Advanced Search Utility
 * Handles Search History, Autocomplete, and Local Filtering
 */

const RECENT_SEARCHES_KEY = 'partquit_recent_searches';
const MAX_HISTORY = 10;

export const searchService = {
  /**
   * Add a term to search history
   */
  addToHistory(term) {
    if (!term || term.trim().length < 2) return;
    
    let history = this.getHistory();
    // Remove if already exists (to move to top)
    history = history.filter(h => h.toLowerCase() !== term.toLowerCase());
    // Add to top
    history.unshift(term.trim());
    // Limit size
    history = history.slice(0, MAX_HISTORY);
    
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(history));
    window.dispatchEvent(new CustomEvent('searchHistoryChanged'));
  },

  /**
   * Get recent search history
   */
  getHistory() {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    try {
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Clear search history
   */
  clearHistory() {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    window.dispatchEvent(new CustomEvent('searchHistoryChanged'));
  },

  /**
   * Filter items locally (for offline support)
   */
  filterLocally(items, criteria) {
    const { 
      term, 
      category_id, 
      fornecedor_id, 
      stock_status, // 'all', 'low', 'zero'
      min_price, 
      max_price 
    } = criteria;

    return items.filter(item => {
      // 1. Text Search (Name or Code or Barcode if exists)
      if (term) {
        const t = term.toLowerCase();
        const matchesText = 
          item.nome?.toLowerCase().includes(t) || 
          item.codigo?.toLowerCase().includes(t) ||
          item.localizacao?.toLowerCase().includes(t);
        
        if (!matchesText) return false;
      }

      // 2. Category
      if (category_id && item.categoria_id !== category_id) return false;

      // 3. Supplier
      if (fornecedor_id && item.fornecedor_id !== fornecedor_id) return false;

      // 4. Stock Status
      if (stock_status === 'low') {
        if (item.stock_atual >= item.stock_minimo) return false;
      } else if (stock_status === 'zero') {
        if (item.stock_atual > 0) return false;
      }

      // 5. Price Range
      if (min_price && item.preco_venda < parseFloat(min_price)) return false;
      if (max_price && item.preco_venda > parseFloat(max_price)) return false;

      return true;
    });
  },

  /**
   * Autocomplete suggestions
   */
  getSuggestions(items, term) {
    if (!term || term.length < 2) return [];
    
    const t = term.toLowerCase();
    return items
      .filter(item => 
        item.nome.toLowerCase().includes(t) || 
        item.codigo.toLowerCase().includes(t)
      )
      .slice(0, 5)
      .map(item => ({
        id: item.id,
        label: `${item.codigo} - ${item.nome}`,
        type: 'item'
      }));
  }
};

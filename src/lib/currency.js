
// Currency Management Logic

// Default exchange rate: 1 USD = 65 MZN (Approximate, can be updated)
// In a real app, this should be fetched from an API
export const EXCHANGE_RATE = 64; 

const STORAGE_KEY = 'partquit_currency';
const EVENT_NAME = 'currencyChange';

export const CURRENCIES = {
  USD: { code: 'USD', locale: 'en-US', symbol: '$', name: 'Dólar (USD)' },
  MZN: { code: 'MZN', locale: 'pt-MZ', symbol: 'MT', name: 'Metical (MZN)' }
};

export function getCurrentCurrency() {
  return localStorage.getItem(STORAGE_KEY) || 'MZN';
}

export function setCurrency(currencyCode) {
  if (!CURRENCIES[currencyCode]) {
    console.error(`Invalid currency code: ${currencyCode}`);
    return;
  }
  
  localStorage.setItem(STORAGE_KEY, currencyCode);
  
  // Dispatch event for reactive UI updates
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { 
    detail: { currency: currencyCode } 
  }));
  
  // Reload logic is handled in main.js usually, or we can rely on store listeners
  // But since formatCurrency is used synchronously in render functions, 
  // we often need to re-render the whole page or components.
}

/**
 * Converts a value based on the current currency setting.
 * ASSUMPTION: The input 'value' is stored in the database as USD.
 * 
 * @param {number} valueInUSD - The value from the database (in USD)
 * @returns {number} - The converted value
 */
export function convertValue(valueInUSD) {
  if (valueInUSD === null || valueInUSD === undefined) return 0;
  
  const current = getCurrentCurrency();
  
  if (current === 'USD') {
    return valueInUSD;
  } else {
    // Convert USD to MZN
    return valueInUSD * EXCHANGE_RATE;
  }
}

/**
 * Formats a monetary value based on the current currency setting.
 * ASSUMPTION: The input 'value' is stored in the database as USD.
 * 
 * @param {number} valueInUSD - The value from the database (in USD)
 * @returns {string} - The formatted currency string
 */
export function formatMoney(valueInUSD) {
  if (valueInUSD === null || valueInUSD === undefined || isNaN(valueInUSD)) {
    return convertValue(0).toLocaleString(CURRENCIES[getCurrentCurrency()].locale, {
      style: 'currency',
      currency: CURRENCIES[getCurrentCurrency()].code
    });
  }

  const current = getCurrentCurrency();
  const convertedValue = convertValue(valueInUSD);
  
  return new Intl.NumberFormat(CURRENCIES[current].locale, {
    style: 'currency',
    currency: CURRENCIES[current].code
  }).format(convertedValue);
}

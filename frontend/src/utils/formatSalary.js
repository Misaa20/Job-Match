/**
 * Format salary based on currency with proper symbols and locale formatting
 */

// Currency configuration with locale and display settings
const CURRENCY_CONFIG = {
  USD: { locale: 'en-US', symbol: '$' },
  EUR: { locale: 'de-DE', symbol: '€' },
  GBP: { locale: 'en-GB', symbol: '£' },
  INR: { locale: 'en-IN', symbol: '₹' },
  CAD: { locale: 'en-CA', symbol: 'CA$' },
  AUD: { locale: 'en-AU', symbol: 'A$' },
  JPY: { locale: 'ja-JP', symbol: '¥' },
  CNY: { locale: 'zh-CN', symbol: '¥' },
  SGD: { locale: 'en-SG', symbol: 'S$' },
  AED: { locale: 'ar-AE', symbol: 'AED' },
};

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (USD, EUR, GBP, INR, etc.)
 * @param {boolean} compact - Whether to use compact notation (e.g., 50K, 1L, 1M)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', compact = false) => {
  if (!amount && amount !== 0) return '';
  
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
  
  try {
    if (compact) {
      // For compact display, use custom logic based on currency
      return formatCompact(amount, currency, config);
    }
    
    // Full format using Intl.NumberFormat
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    // Fallback if currency code is not supported
    return `${config.symbol}${new Intl.NumberFormat(config.locale).format(amount)}`;
  }
};

/**
 * Format number in compact notation based on currency conventions
 * - INR: Uses Lakhs (L) and Crores (Cr) system
 * - Others: Uses K (thousands) and M (millions)
 */
const formatCompact = (amount, currency, config) => {
  const symbol = config.symbol;
  
  if (currency === 'INR') {
    // Indian numbering system: Lakhs and Crores
    if (amount >= 10000000) {
      // Crores (1 Cr = 10,000,000)
      const crores = amount / 10000000;
      return `${symbol}${crores % 1 === 0 ? crores : crores.toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      // Lakhs (1 L = 100,000)
      const lakhs = amount / 100000;
      return `${symbol}${lakhs % 1 === 0 ? lakhs : lakhs.toFixed(1)}L`;
    } else if (amount >= 1000) {
      // Thousands
      const thousands = amount / 1000;
      return `${symbol}${thousands % 1 === 0 ? thousands : thousands.toFixed(1)}K`;
    }
    return `${symbol}${amount}`;
  }
  
  // Western numbering system: K and M
  if (amount >= 1000000) {
    const millions = amount / 1000000;
    return `${symbol}${millions % 1 === 0 ? millions : millions.toFixed(1)}M`;
  } else if (amount >= 1000) {
    const thousands = amount / 1000;
    return `${symbol}${thousands % 1 === 0 ? thousands : thousands.toFixed(0)}K`;
  }
  
  return `${symbol}${amount}`;
};

/**
 * Format salary range for display
 * @param {Object} salary - Salary object with min, max, and currency
 * @param {boolean} compact - Whether to use compact notation
 * @returns {string|null} Formatted salary range or null if not specified
 */
export const formatSalaryRange = (salary, compact = true) => {
  if (!salary) return null;
  if (!salary.min && !salary.max) return null;
  
  const currency = salary.currency || 'USD';
  
  if (salary.min && salary.max) {
    const minFormatted = formatCurrency(salary.min, currency, compact);
    const maxFormatted = formatCurrency(salary.max, currency, compact);
    return `${minFormatted} - ${maxFormatted}`;
  }
  
  if (salary.min) {
    return `${formatCurrency(salary.min, currency, compact)}+`;
  }
  
  if (salary.max) {
    return `Up to ${formatCurrency(salary.max, currency, compact)}`;
  }
  
  return null;
};

/**
 * Format salary range for detailed display (full numbers)
 * @param {Object} salary - Salary object with min, max, and currency
 * @returns {string} Formatted salary range or 'Not specified'
 */
export const formatSalaryFull = (salary) => {
  if (!salary) return 'Not specified';
  if (!salary.min && !salary.max) return 'Not specified';
  
  const currency = salary.currency || 'USD';
  
  if (salary.min && salary.max) {
    const minFormatted = formatCurrency(salary.min, currency, false);
    const maxFormatted = formatCurrency(salary.max, currency, false);
    return `${minFormatted} - ${maxFormatted}`;
  }
  
  if (salary.min) {
    return `${formatCurrency(salary.min, currency, false)}+`;
  }
  
  if (salary.max) {
    return `Up to ${formatCurrency(salary.max, currency, false)}`;
  }
  
  return 'Not specified';
};

export default {
  formatCurrency,
  formatSalaryRange,
  formatSalaryFull,
};

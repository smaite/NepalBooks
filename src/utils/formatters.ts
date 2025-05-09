import dayjs from 'dayjs';
import 'dayjs/locale/ne';

/**
 * Format a number as currency
 * @param value The value to format
 * @param currency The currency code (NPR, USD, etc.)
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, currency: string = 'NPR'): string => {
  const formatter = new Intl.NumberFormat('ne-NP', {
    style: 'currency',
    currency: currency || 'NPR',
    minimumFractionDigits: 2,
  });
  
  return formatter.format(value);
};

/**
 * Get Nepali month name
 * @param month Month number (1-12)
 * @returns Nepali month name
 */
export const getNepaliMonthName = (month: number): string => {
  const nepaliMonths = [
    'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 
    'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 
    'Poush', 'Magh', 'Falgun', 'Chaitra'
  ];
  
  // Adjust for 0-indexed array
  return nepaliMonths[(month - 1) % 12];
};

/**
 * Format a date to Nepali format
 * @param date The date to format
 * @param format The format to use (YYYY-MM-DD, BS, etc.)
 * @returns Formatted date string
 */
export const formatDate = (date: Date, format: string = 'YYYY-MM-DD'): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  switch (format) {
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    case 'MM-DD-YYYY':
      return `${month}-${day}-${year}`;
    case 'BS':
      // This is a placeholder - real implementation would convert to Bikram Sambat
      return `${year}-${month}-${day} BS`;
    case 'YYYY-MM-DD':
    default:
      return `${year}-${month}-${day}`;
  }
};

/**
 * Format a number with thousands separators
 * @param value The value to format
 * @param decimals Number of decimal places
 * @returns Formatted number string
 */
export const formatNumber = (value: number, decimals: number = 0): string => {
  return value.toLocaleString('ne-NP', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Calculate VAT amount
 * @param amount The base amount
 * @param vatRate The VAT rate percentage
 * @returns The VAT amount
 */
export const calculateVAT = (amount: number, vatRate: number = 13): number => {
  return amount * (vatRate / 100);
};

/**
 * Add VAT to an amount
 * @param amount The base amount
 * @param vatRate The VAT rate percentage
 * @returns The amount including VAT
 */
export const addVAT = (amount: number, vatRate: number = 13): number => {
  return amount + calculateVAT(amount, vatRate);
};

export const formatNepaliDate = (date: Date | string): string => {
  return dayjs(date).locale('ne').format('YYYY MMMM DD');
};

export const formatNepaliMonth = (date: Date | string): string => {
  return dayjs(date).locale('ne').format('MMMM YYYY');
};

export const formatNepaliYear = (date: Date | string): string => {
  return dayjs(date).locale('ne').format('YYYY');
};

export const getNepaliDayName = (day: number): string => {
  const days = [
    'आइतबार',
    'सोमबार',
    'मंगलबार',
    'बुधबार',
    'बिहिबार',
    'शुक्रबार',
    'शनिबार',
  ];
  return days[day];
}; 
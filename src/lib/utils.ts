import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const exchangeRates: Record<string, number> = {
  'USD': 615,
  'EUR': 655,
  'XOF': 1,
};


export function formatCurrency(amount: number, currency: string = 'XOF', compact = false) {
  const amountInXOF = amount; // Assuming stored amounts are in XOF

  const convertedAmount = amountInXOF / exchangeRates[currency];

  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  };
  
  if (compact) {
    options.notation = 'compact';
    options.maximumFractionDigits = 1;
  }

  if (currency === 'XOF') {
    options.currencyDisplay = 'code';
    options.minimumFractionDigits = 0;
    
    const locale = 'fr-FR';
    let formatted = new Intl.NumberFormat(locale, options).format(convertedAmount);
    // Replace XOF with FCFA for display
    return formatted.replace('XOF', 'FCFA');
  }

  const locale = currency === 'EUR' ? 'fr-FR' : 'en-US';

  return new Intl.NumberFormat(locale, options).format(convertedAmount);
}

/**
 * Format numbers in Indian numbering system (Lakhs, Crores)
 * e.g. 510055 -> 5,10,055
 */
export function formatCurrencyINR(amount: number, includeSymbol: boolean = true, decimals: number = 0): string {
  if (isNaN(amount)) return includeSymbol ? '₹0' : '0';
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  let formatted = '';
  if (decimals > 0) {
    formatted = absAmount.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  } else {
    formatted = absAmount.toLocaleString('en-IN', {
      maximumFractionDigits: 0,
    });
  }

  const sign = isNegative ? '-' : '';
  const symbol = includeSymbol ? '₹' : '';
  return `${sign}${symbol}${formatted}`;
}

export function formatNumberINR(amount: number): string {
  return formatCurrencyINR(amount, false, 0);
}

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertLessThanOneThousand(num: number): string {
  let current = '';
  if (num % 100 < 20) {
    current = ones[num % 100];
    num = Math.floor(num / 100);
  } else {
    current = ones[num % 10];
    num = Math.floor(num / 10);
    current = tens[num % 10] + (current ? ' ' + current : '');
    num = Math.floor(num / 10);
  }
  if (num === 0) return current;
  return ones[num] + ' Hundred' + (current ? ' ' + current : '');
}

/**
 * Converts a number to Indian currency words format
 * e.g. 510055 -> "Five Lakh Ten Thousand Fifty-Five Rupees Only"
 */
export function numberToWordsINR(amount: number): string {
  if (amount === 0) return 'Zero Rupees Only';
  if (isNaN(amount)) return '';

  const whole = Math.floor(Math.abs(amount));
  const paise = Math.round((Math.abs(amount) - whole) * 100);

  let numStr = whole.toString();
  let result = '';

  // Crores
  if (numStr.length > 7) {
    const crores = parseInt(numStr.slice(0, numStr.length - 7), 10);
    result += convertLessThanOneThousand(crores) + ' Crore ';
    numStr = numStr.slice(numStr.length - 7);
  }

  // Lakhs
  if (numStr.length > 5) {
    const lakhs = parseInt(numStr.slice(0, numStr.length - 5), 10);
    if (lakhs > 0) {
      result += convertLessThanOneThousand(lakhs) + ' Lakh ';
    }
    numStr = numStr.slice(numStr.length - 5);
  }

  // Thousands
  if (numStr.length > 3) {
    const thousands = parseInt(numStr.slice(0, numStr.length - 3), 10);
    if (thousands > 0) {
      result += convertLessThanOneThousand(thousands) + ' Thousand ';
    }
    numStr = numStr.slice(numStr.length - 3);
  }

  // Remaining (hundreds and below)
  const remaining = parseInt(numStr, 10);
  if (remaining > 0) {
    result += convertLessThanOneThousand(remaining) + ' ';
  }

  result = result.trim() + ' Rupees';

  if (paise > 0) {
    result += ' and ' + convertLessThanOneThousand(paise) + ' Paise';
  }

  return result + ' Only';
}

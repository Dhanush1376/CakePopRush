export const formatCurrency = (amountInPaise: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0, // Don't show .00 for whole amounts
    maximumFractionDigits: 0, // Menu references don't show decimals
  }).format(amountInPaise / 100)
}

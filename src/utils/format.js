// frontend/src/utils/format.js
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'LKR 0';
  return `LKR ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-LK');
};

export const truncate = (str, length = 50) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};
const STORAGE_KEY = 'repair_discounts';

export const getAllDiscounts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to parse discounts:', error);
    return {};
  }
};

export const getDiscount = (repairId) => {
  const all = getAllDiscounts();
  return all[repairId] || null;
};

export const saveDiscount = (repairId, discount) => {
  if (!repairId) {
    console.error('saveDiscount: repairId required');
    return false;
  }
  if (!discount || typeof discount !== 'object' || !discount.type || typeof discount.value !== 'number' || discount.value <= 0) {
    console.error('saveDiscount: invalid discount object');
    return false;
  }
  try {
    const all = getAllDiscounts();
    all[repairId] = { type: discount.type, value: discount.value };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return true;
  } catch (error) {
    console.error('Failed to save discount:', error);
    return false;
  }
};

export const removeDiscount = (repairId) => {
  try {
    const all = getAllDiscounts();
    if (all[repairId]) {
      delete all[repairId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }
    return true;
  } catch (error) {
    console.error('Failed to remove discount:', error);
    return false;
  }
};

export const calculateDiscountedTotal = (originalTotal, discount) => {
  if (!discount) return originalTotal;
  let discounted = originalTotal;
  if (discount.type === 'percentage') {
    discounted = originalTotal - (originalTotal * discount.value / 100);
  } else {
    discounted = originalTotal - discount.value;
  }
  return Math.max(0, discounted);
};
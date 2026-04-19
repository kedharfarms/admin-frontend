
export const formatISTTime = (timeStr) => {
  if (!timeStr) return '-';
  const date = new Date(timeStr);
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: true,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const populateAddress = (address) => {
  if (!address) return '-';

  const parts = [
    address.name,
    address.house,
    address.street,
    address.city,
    address.pincode
  ];

  // Remove empty/undefined values and join with comma
  return parts.filter(Boolean).join(', ');
};
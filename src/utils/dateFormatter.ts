/**
 * Formats a date from yyyy-mm-dd to dd/mm/yyyy
 * @param dateString - Date string in yyyy-mm-dd format
 * @returns Formatted date string in dd/mm/yyyy format
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

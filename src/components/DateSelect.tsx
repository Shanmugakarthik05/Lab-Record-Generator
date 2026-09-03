/**
 * DateSelect – Three dropdown selectors for Day / Month / Year.
 * Value format: "YYYY-MM-DD" (same as HTML date input, so existing saved data
 * continues to work without any migration).
 *
 * When any dropdown is cleared the component emits an empty string.
 */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function daysInMonth(month: number, year: number) {
  // month is 1-based
  if (!month) return 31;
  return new Date(year || 2000, month, 0).getDate();
}

interface DateSelectProps {
  id?: string;
  /** ISO date string "YYYY-MM-DD" or empty string */
  value: string;
  onChange: (isoDate: string) => void;
  className?: string;
}

export function DateSelect({ id, value, onChange, className = '' }: DateSelectProps) {
  // Parse existing value
  const [y, m, d] = value ? value.split('-').map(Number) : [0, 0, 0];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i); // 2 past, 3 future
  const maxDay = daysInMonth(m, y);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  const emit = (day: number, month: number, year: number) => {
    if (day && month && year) {
      const dd = String(day).padStart(2, '0');
      const mm = String(month).padStart(2, '0');
      onChange(`${year}-${mm}-${dd}`);
    } else {
      onChange('');
    }
  };

  const selBase = `
    h-10 rounded-md border border-input bg-background px-2 py-2 text-sm
    ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring
    focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
    ${className}
  `;

  return (
    <div className="flex gap-1" id={id}>
      {/* Day */}
      <select
        aria-label="Day"
        value={d || ''}
        onChange={e => emit(Number(e.target.value), m, y)}
        className={selBase + ' w-16'}
      >
        <option value="">DD</option>
        {days.map(n => (
          <option key={n} value={n}>{String(n).padStart(2, '0')}</option>
        ))}
      </select>

      {/* Month */}
      <select
        aria-label="Month"
        value={m || ''}
        onChange={e => emit(d, Number(e.target.value), y)}
        className={selBase + ' flex-1'}
      >
        <option value="">Month</option>
        {MONTHS.map((name, i) => (
          <option key={i + 1} value={i + 1}>{name}</option>
        ))}
      </select>

      {/* Year */}
      <select
        aria-label="Year"
        value={y || ''}
        onChange={e => emit(d, m, Number(e.target.value))}
        className={selBase + ' w-24'}
      >
        <option value="">YYYY</option>
        {years.map(n => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>
  );
}

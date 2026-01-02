'use client';

interface DropdownProps {
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function Dropdown({ options, value, onChange, placeholder = 'Select an option...' }: DropdownProps) {
  return (
    <div className="w-full">
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border-2 border-revaya-light-gray rounded-lg
          focus:outline-none focus:ring-2 focus:ring-revaya-teal focus:border-revaya-teal
          hover:border-revaya-teal
          transition-all duration-200 text-base font-normal text-revaya-dark-gray
          bg-white cursor-pointer shadow-sm focus:shadow-md"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

// src/components/ui/Select.tsx
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  options,
  className,
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2 font-montserrat">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full px-4 py-3 border rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 outline-none appearance-none',
          error ? 'border-error-500 focus:border-error-500 focus:ring-error-200' : 'border-gray-300',
          'font-montserrat bg-white',
          className
        )}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-2 text-sm text-error-600 font-montserrat">{error}</p>
      )}
    </div>
  );
}
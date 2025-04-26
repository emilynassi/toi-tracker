//Component to represent a select input with a neo design
//It receives the items to be displayed in the select input and shows the selected item
import React, { useState, useRef, useEffect } from 'react';

interface NeoSelectProps {
  items: React.ReactNode[];
  value?: number; // The index of the selected item
  onChange?: (value: number) => void; // Callback when selection changes
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean; // Whether the select is disabled
  placeholder?: string; // Optional placeholder text when no item is selected
}

const NeoSelect = ({
  items,
  value,
  onChange,
  className = '',
  style = {},
  disabled = false,
  placeholder = 'Select an option...',
}: NeoSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine what to display in the button
  const isPlaceholder = value === undefined;
  const displayText =
    isPlaceholder || items.length === 0 ? placeholder : items[value as number];
  const placeholderClass =
    isPlaceholder || items.length === 0 ? 'text-gray-500 italic' : '';

  return (
    <div
      className={`relative inline-block ${className}`}
      style={style}
      ref={dropdownRef}
    >
      <button
        className={`appearance-none bg-transparent border-2 border-black font-bold py-2 pl-4 pr-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black w-full ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        } ${placeholderClass}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none',
        }}
      >
        {displayText}
      </button>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg
          className={`h-6 w-6 text-black transform transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && !disabled && items.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          {items.map((item, index) => (
            <button
              key={index}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 font-bold text-black"
              onClick={() => {
                onChange?.(index);
                setIsOpen(false);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export { NeoSelect };

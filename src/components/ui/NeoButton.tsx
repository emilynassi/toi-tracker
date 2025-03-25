import React from 'react';

interface NeoButtonProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  primaryColor?: string;
  textColor?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  rotate?: boolean;
}

const NeoButton = ({
  children,
  onClick,
  primaryColor = '#4C7BF4', // Default primary color
  textColor,
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
  rotate = false,
  ...otherProps
}: NeoButtonProps) => {
  // Determine if we should use white text based on the background color
  const shouldUseWhiteText = () => {
    // Default to what was passed in
    if (textColor) return textColor;

    // If primary color is white, use black text
    if (primaryColor === '#FFFFFF' || primaryColor.toLowerCase() === '#fff') {
      return '#000';
    }

    // Simple logic: for dark colors use white text, for light colors use black
    try {
      const hex = primaryColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness < 128 ? '#fff' : '#000';
    } catch (e) {
      return '#000'; // Fallback to black if color parsing fails
    }
  };

  const getButtonClasses = () => {
    // Base classes for neobrutalist style
    let classes =
      'border-4 border-black font-bold shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]';

    // Only add hover and active states if not disabled
    if (!disabled) {
      classes +=
        ' hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all';
    }

    // Size-specific classes
    if (size === 'sm') {
      classes += ' px-3 py-1.5 text-sm';
    } else if (size === 'md') {
      classes += ' px-6 py-3 text-lg';
    } else if (size === 'lg') {
      classes += ' px-8 py-4 text-xl';
    }

    // Rotation for fun styling
    if (rotate) {
      classes += ' transform rotate-1';
    }

    // Disabled state
    if (disabled) {
      classes += ' opacity-50 cursor-not-allowed';
    }

    return `${classes} ${className}`.trim();
  };

  return (
    <button
      type={type}
      className={getButtonClasses()}
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: primaryColor,
        color: shouldUseWhiteText(),
      }}
      {...otherProps}
    >
      {children}
    </button>
  );
};

export { NeoButton };

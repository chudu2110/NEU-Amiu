
import React from 'react';

interface IconButtonProps {
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
    size?: 'normal' | 'large';
}

const IconButton: React.FC<IconButtonProps> = ({ onClick, children, className = '', size = 'normal' }) => {
    const sizeClasses = size === 'normal' 
        ? 'w-16 h-16' 
        : 'w-20 h-20';

    return (
        <button
            onClick={onClick}
            className={`rounded-full flex items-center justify-center transform hover:scale-110 transition-transform duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${sizeClasses} ${className}`}
        >
            {children}
        </button>
    );
};

export default IconButton;
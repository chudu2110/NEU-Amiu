
import React from 'react';
import { useStore } from '../hooks/useStore';
import { SunIcon, MoonIcon } from '../assets/icons';

const ThemeToggle: React.FC<{ className?: string; title?: string }> = ({ className, title }) => {
    const { theme, setTheme } = useStore();

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <button
            onClick={toggleTheme}
            title={title}
            className={className || "p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"}
        >
            {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
        </button>
    );
};

export default ThemeToggle;

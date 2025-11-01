
import React from 'react';
import { useStore } from '../hooks/useStore';
import { LanguageIcon } from '../assets/icons';

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useStore();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'vi' : 'en');
    };

    return (
        <button
            onClick={toggleLanguage}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
        >
            <LanguageIcon className="w-6 h-6" />
            <span className="font-semibold text-sm">{language.toUpperCase()}</span>
        </button>
    );
};

export default LanguageSwitcher;

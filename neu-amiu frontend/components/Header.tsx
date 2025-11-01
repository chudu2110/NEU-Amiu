
import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import ThemeToggle from './ThemeToggle';
import { LogoutIcon, NotificationIcon, SettingsIcon, LanguageIcon } from '../assets/icons';

const Header: React.FC = () => {
    const { logout, t, language, setLanguage } = useStore();
    const appName = t('appName');
    const firstChar = appName.charAt(0);
    const restChars = appName.slice(1);

    const [settingsOpen, setSettingsOpen] = useState(false);

    return (
        <header className="flex items-center justify-between p-4 bg-[#F7F8FB]/90 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm z-10 w-full">
            <h1 className="brand-font text-2xl font-extrabold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                <span className="logo-n-font uppercase">{firstChar}</span>
                <span className="brand-font">{restChars}</span>
            </h1>
            <div className="flex items-center space-x-4 relative">
                <button 
                    onClick={() => console.log('Notifications clicked')} 
                    title={t('notifications')}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-[#EDEFF5] dark:hover:bg-gray-700 transition-colors"
                >
                    <NotificationIcon className="w-6 h-6" />
                </button>
                <button 
                    onClick={() => setSettingsOpen(!settingsOpen)} 
                    title={t('settings')}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-[#EDEFF5] dark:hover:bg-gray-700 transition-colors"
                >
                    <SettingsIcon className="w-6 h-6" />
                </button>
                {settingsOpen && (
                  <div className="absolute right-0 top-12 bg-white/80 dark:bg-gray-800/90 backdrop-blur-md shadow-xl rounded-2xl border border-gray-200/70 dark:border-gray-700 p-3">
                    <div className="flex items-center gap-3">
                      <ThemeToggle title="Theme" className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 text-gray-700 hover:bg-[#EDEFF5] dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700" />
                      <button
                        onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
                        title="Language"
                        className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 text-gray-700 hover:bg-[#EDEFF5] dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        <LanguageIcon className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => { setSettingsOpen(false); logout(); }}
                        title={t('logout')}
                        className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 text-gray-700 hover:bg-[#EDEFF5] dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        <LogoutIcon className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                )}
            </div>
        </header>
    );
};

export default Header;
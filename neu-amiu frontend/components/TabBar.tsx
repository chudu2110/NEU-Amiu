import React from 'react';
import { useStore } from '../hooks/useStore';
import type { Page } from '../App';
import { SwipeIcon, ChatBubbleIcon, UserIcon } from '../assets/icons';

interface TabBarProps {
    activePage: Page;
    setActivePage: (page: Page) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activePage, setActivePage }) => {
    const { t } = useStore();

    // Fix: Replaced JSX.Element with React.ReactNode to resolve the "Cannot find namespace 'JSX'" error.
    const tabs: { page: Page; label: string; icon: React.ReactNode }[] = [
        { page: 'swipe', label: t('tabSwipe'), icon: <SwipeIcon className="w-6 h-6 mb-1" /> },
        { page: 'chats', label: t('tabChats'), icon: <ChatBubbleIcon className="w-6 h-6 mb-1" /> },
        { page: 'profile', label: t('tabProfile'), icon: <UserIcon className="w-6 h-6 mb-1" /> },
    ];

    return (
        <div className="flex justify-around items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-[0_-2px_5px_rgba(0,0,0,0.1)] dark:shadow-[0_-2px_5px_rgba(0,0,0,0.3)]">
            {tabs.map((tab) => (
                <button
                    key={tab.page}
                    onClick={() => setActivePage(tab.page)}
                    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs font-medium transition-colors duration-200 ${
                        activePage === tab.page
                            ? 'text-blue-500'
                            : 'text-gray-500 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-400'
                    }`}
                >
                    {tab.icon}
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default TabBar;
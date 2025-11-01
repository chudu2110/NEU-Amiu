import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import Header from './Header';
import type { Page } from '../App';
import ChatPage from './ChatPage';
import type { User } from '../types';

interface ChatListPageProps {
  setActivePage: (page: Page) => void;
}

const ChatListPage: React.FC<ChatListPageProps> = ({ setActivePage }) => {
    const { t, matches, chats } = useStore();
    const [selectedChatUser, setSelectedChatUser] = useState<User | null>(null);
    
    const getLastMessage = (matchId: number) => {
        const chat = chats.find(c => c.matchId === matchId);
        if (chat && chat.messages.length > 0) {
            const lastMsg = chat.messages[chat.messages.length - 1];
            const prefix = lastMsg.sender === 'me' ? 'You: ' : '';
            switch (lastMsg.type) {
                case 'text':
                    return `${prefix}${lastMsg.content}`;
                case 'image':
                    return `${prefix}📷 ${t('image')}`;
                case 'audio':
                    return `${prefix}🎤 ${t('voiceMessage')}`;
                case 'location':
                    return `${prefix}📍 ${t('location')}`;
                case 'gif':
                    return `${prefix}GIF`;
                default:
                    return '';
            }
        }
        const matchName = matches.find(m => m.id === matchId)?.name || 'someone';
        return t('startConversation', { name: matchName });
    }

    if (selectedChatUser) {
        return <ChatPage user={selectedChatUser} onBack={() => setSelectedChatUser(null)} />;
    }

    return (
        <div className="flex flex-col h-full">
            <Header />
            <main className="flex-grow p-4 overflow-y-auto">
                <h2 className="text-3xl font-bold mb-4">{t('messages')}</h2>
                {matches.length > 0 ? (
                    <div className="space-y-2">
                        {matches.map(match => (
                            <button 
                                key={match.id} 
                                className="w-full flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                onClick={() => setSelectedChatUser(match)}
                            >
                                <img src={match.image} alt={match.name} className="w-14 h-14 rounded-full object-cover mr-4" />
                                <div className="flex-grow overflow-hidden">
                                    <h3 className="font-bold text-lg">{match.name}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{getLastMessage(match.id)}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center mt-20">
                        <h3 className="text-xl font-semibold">{t('noMatches')}</h3>
                        <p className="text-gray-500 mt-2">{t('noMatchesInfo')}</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ChatListPage;
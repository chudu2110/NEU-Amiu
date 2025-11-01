
import React from 'react';
import type { User } from '../types';
import { useStore } from '../hooks/useStore';

interface MatchModalProps {
    matchedUser: User;
    onClose: () => void;
    onStartChat: () => void;
}

const MatchModal: React.FC<MatchModalProps> = ({ matchedUser, onClose, onStartChat }) => {
    const { t, myPhotos } = useStore();
    
    const handleStartChatting = () => {
        console.log('Start chatting with', matchedUser.name);
        onStartChat();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative w-full max-w-md text-center">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white animate-pulse">
                    <span className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">{t('itsAMatch')}</span>
                </h1>
                <p className="text-white mt-4 text-lg">{t('matchMessage', { name: matchedUser.name })}</p>

                <div className="flex items-center justify-center space-x-[-40px] my-8">
                    <img src={myPhotos[0]} alt="You" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
                    <img src={matchedUser.image} alt={matchedUser.name} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
                </div>

                <div className="flex flex-col space-y-4">
                    <button
                        onClick={handleStartChatting}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-cyan-600 transform hover:scale-105 transition duration-300"
                    >
                        {t('startChatting')}
                    </button>
                     <button
                        onClick={onClose}
                        className="w-full bg-transparent border-2 border-white text-white font-bold py-3 px-4 rounded-lg hover:bg-white hover:text-black transition duration-300"
                    >
                        {t('keepSwiping')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MatchModal;

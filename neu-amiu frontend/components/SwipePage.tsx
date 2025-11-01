
import React, { useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { users as initialUsers } from '../data/users';
import type { User } from '../types';
import type { Page } from '../App';
import Header from './Header';
import ProfileCard from './ProfileCard';
import IconButton from './IconButton';
import MatchModal from './MatchModal';
import { CrossIcon, HeartIcon, StarIcon } from '../assets/icons';

interface SwipePageProps {
    setActivePage: (page: Page) => void;
}

const SwipePage: React.FC<SwipePageProps> = ({ setActivePage }) => {
    const [users, setUsers] = useState(initialUsers);
    const [currentIndex, setCurrentIndex] = useState(users.length - 1);
    const { t, addMatch } = useStore();
    const [matchedUser, setMatchedUser] = useState<User | null>(null);

    const canSwipe = currentIndex >= 0;

    const childRefs = useMemo<React.RefObject<any>[]>(() =>
        Array(initialUsers.length)
        .fill(0)
        .map(() => React.createRef()),
        [initialUsers.length]
    );

    const swipe = async (dir: 'left' | 'right') => {
        if (canSwipe) {
            await childRefs[currentIndex].current.swipe(dir);
        }
    };
    
    const onSwipe = (user: User, direction: 'left' | 'right') => {
        setCurrentIndex((prev) => prev - 1);
        console.log(`You swiped ${direction} on ${user.name}`);

        if (direction === 'right') {
            addMatch(user);
            setMatchedUser(user);
        }
    };

    const closeMatchModal = () => {
        setMatchedUser(null);
    }
    
    const handleStartChat = () => {
        setMatchedUser(null);
        setActivePage('chats');
    }


    return (
        <div className="flex flex-col h-full overflow-hidden">
            <Header />
            <main className="flex-grow flex flex-col items-center justify-center p-4 relative">
                <div className="relative w-full max-w-sm h-[70vh] max-h-[600px] flex items-center justify-center" style={{ animation: 'floatY 7s ease-in-out infinite' }}>
                    <div className="absolute inset-0 -z-10 rounded-3xl" style={{
                        backgroundImage: 'radial-gradient(1200px 400px at 10% 10%, rgba(253, 164, 175, 0.25), transparent), radial-gradient(800px 300px at 90% 20%, rgba(147, 197, 253, 0.25), transparent), linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))'
                    }} />
                    <div className="absolute inset-0 -z-20 rounded-3xl backdrop-blur-[2px]" />
                    {users.map((user, index) => (
                        <ProfileCard
                            ref={childRefs[index]}
                            key={user.id}
                            user={user}
                            onSwipe={(dir) => onSwipe(user, dir)}
                            isTop={index === currentIndex}
                        />
                    ))}
                    {!canSwipe && (
                        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('noMoreProfiles')}</h2>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">{t('comeBackLater')}</p>
                        </div>
                    )}
                </div>

                {canSwipe && (
                    <div className="flex justify-center items-center space-x-6 mt-6">
                        <IconButton onClick={() => swipe('left')} className="bg-white dark:bg-gray-700 text-yellow-500 shadow-lg">
                            <CrossIcon className="w-8 h-8" />
                        </IconButton>
                        <IconButton onClick={() => swipe('right')} size="large" className="bg-white dark:bg-gray-700 text-red-500 shadow-lg">
                            <HeartIcon className="w-10 h-10" />
                        </IconButton>
                        <IconButton className="bg-white dark:bg-gray-700 text-blue-500 shadow-lg">
                            <StarIcon className="w-8 h-8" />
                        </IconButton>
                    </div>
                )}
            </main>
            {matchedUser && <MatchModal matchedUser={matchedUser} onClose={closeMatchModal} onStartChat={handleStartChat} />}
        </div>
    );
};

export default SwipePage;

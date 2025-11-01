import React, { useState, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import type { User } from '../types';
import { useStore } from '../hooks/useStore';
import { locales } from '../i18n/locales';

interface ProfileCardProps {
    user: User;
    onSwipe: (direction: 'left' | 'right') => void;
    isTop: boolean;
}

const ProfileCard = forwardRef<any, ProfileCardProps>(({ user, onSwipe, isTop }, ref) => {
    const { t, myProfile } = useStore();
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [transition, setTransition] = useState('transform 0.3s ease-out, opacity 0.3s ease-out');
    const [isFlipped, setIsFlipped] = useState(false);
    const lastTapRef = useRef<number>(0);

    const cardRef = useRef<HTMLDivElement>(null);

    const rotation = useMemo(() => position.x / 20, [position.x]);
    const opacity = useMemo(() => 1 - Math.abs(position.x) / 200, [position.x]);

    useImperativeHandle(ref, () => ({
        swipe: (dir: 'left' | 'right') => {
            const x = dir === 'left' ? -window.innerWidth : window.innerWidth;
            setPosition({ x, y: 0 });
            setTransition('transform 0.5s ease-in, opacity 0.5s ease-in');
            setTimeout(() => {
                onSwipe(dir);
            }, 500);
        }
    }));
    
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isTop) return;
        setIsDragging(true);
        setTransition('');
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setStartPos({ x: clientX, y: clientY });
    };

    const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging || !isTop) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const dx = clientX - startPos.x;
        const dy = clientY - startPos.y;
        setPosition({ x: dx, y: dy });
    };
    
    const handleDragEnd = () => {
        if (!isDragging || !isTop) return;
        setIsDragging(false);
        setTransition('transform 0.3s ease-out, opacity 0.3s ease-out');
        
        if (Math.abs(position.x) > 100) {
            const direction = position.x > 0 ? 'right' : 'left';
            const x = direction === 'right' ? window.innerWidth : -window.innerWidth;
            setPosition({ x, y: position.y });
            setTimeout(() => {
                onSwipe(direction);
            }, 300);
        } else {
            setPosition({ x: 0, y: 0 });
            // Mobile double-tap detection when not swiping
            const now = Date.now();
            if (Math.abs(position.x) < 10 && Math.abs(position.y) < 10) {
                if (now - lastTapRef.current < 250) {
                    setIsFlipped(f => !f);
                }
                lastTapRef.current = now;
            }
        }
    };
    
    return (
        <div
            ref={cardRef}
            className={`absolute w-full h-full flip-container ${isTop ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{
                transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
                transition,
                opacity: isTop ? opacity : 1,
                zIndex: isTop ? 2 : 1,
            }}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            onDoubleClick={() => setIsFlipped(f => !f)}
        >
            <div className={`flipper ${isFlipped ? 'flipped' : ''}`}>
                {(() => {
                    const frame = myProfile.cardFrame || 'classic';
                    const gradients: Record<string, string> = {
                        classic: 'linear-gradient(135deg,#e5e7eb,#d1d5db)',
                        sunset: 'linear-gradient(135deg,#F7B2AD,#FCE7A1)',
                        ocean: 'linear-gradient(135deg,#9AD8D6,#BDE0FE)',
                        forest: 'linear-gradient(135deg,#BFD8B8,#C9D4F0)',
                        glass: 'linear-gradient(135deg,rgba(255,255,255,0.85),rgba(255,255,255,0.55))',
                        luxe: 'linear-gradient(135deg,#D4AF37,#FFD700)',
                        neon: 'linear-gradient(135deg,#00f5d4,#f15bb5)',
                        royal: 'linear-gradient(135deg,#5B6ABF,#9FA8DA)',
                        midnight: 'linear-gradient(135deg,#1f2937,#4b5563)',
                        peach: 'linear-gradient(135deg,#FFB199,#FFD3A5)',
                        cyber: 'linear-gradient(135deg,#00C9FF,#92FE9D)',
                        pastel: 'linear-gradient(135deg,#FFC6FF,#BDE0FE)',
                        aurora: 'linear-gradient(135deg,#00C6FF,#7F00FF)',
                        sakura: 'linear-gradient(135deg,#FFAFCC,#FFC8DD)',
                        rainbow: 'linear-gradient(135deg,#ff9a9e,#a6c1ee)',
                        ember: 'linear-gradient(135deg,#ff512f,#f09819)',
                        ice: 'linear-gradient(135deg,#a1c4fd,#c2e9fb)',
                        violet: 'linear-gradient(135deg,#8E2DE2,#4A00E0)'
                    };
                    const glows: Record<string, string> = {
                        classic: 'rgba(209,213,219,0.35)',
                        sunset: 'rgba(247,178,173,0.35)',
                        ocean: 'rgba(157,216,214,0.35)',
                        forest: 'rgba(191,216,184,0.35)',
                        glass: 'rgba(255,255,255,0.4)',
                        luxe: 'rgba(212,175,55,0.35)',
                        neon: 'rgba(241,91,181,0.35)',
                        royal: 'rgba(95,106,191,0.35)',
                        midnight: 'rgba(31,41,55,0.35)',
                        peach: 'rgba(255,179,153,0.35)',
                        cyber: 'rgba(0,201,255,0.35)',
                        pastel: 'rgba(255,198,255,0.35)',
                        aurora: 'rgba(127,0,255,0.35)',
                        sakura: 'rgba(255,200,221,0.35)',
                        rainbow: 'rgba(166,193,238,0.35)',
                        ember: 'rgba(240,152,25,0.35)',
                        ice: 'rgba(161,196,253,0.35)',
                        violet: 'rgba(142,45,226,0.35)'
                    };
                    const frameGradient = gradients[frame] || gradients.classic;
                    const glow = glows[frame] || glows.classic;
                    const displayName = user.name;
                    const displayAge = user.age;
                    const slogan = '';
                    const avatar = user.image;
                    const mbti = 'MBTI?';
                    const zodiac = 'Cung?';
                    const initials = (displayName || 'U').trim().split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
                    return (
                        <div
                            className="front relative rounded-xl overflow-hidden"
                            style={{
                                border: '6px solid transparent',
                                backgroundImage: `linear-gradient(#0000,#0000), ${frameGradient}`,
                                backgroundClip: 'padding-box, border-box',
                                boxShadow: `0 12px 30px rgba(0,0,0,0.25), 0 0 22px ${glow}`
                            }}
                        >
                            {/* Fallback layer always present so card never looks empty */}
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-200 to-blue-200">
                                <span className="text-3xl font-bold text-black/70">{initials}</span>
                            </div>
                            {avatar && (
                                <img
                                    src={avatar}
                                    alt={displayName}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    loading="eager"
                                    referrerPolicy="no-referrer"
                                    crossOrigin="anonymous"
                                    onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                                />
                            )}
                            <div className="absolute inset-0 p-5 flex flex-col">
                                <div className="flex flex-col gap-1">
                                    <div className="text-xl font-bold text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.75)' }}>{displayName}{displayAge ? `, ${displayAge}` : ''}</div>
                                    {slogan && <div className="text-sm text-white/95" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}>{slogan}</div>}
                                    <div className="flex gap-2 mt-2">
                                        <span className="px-2 py-1 text-xs rounded-full bg-white/20 text-white" style={{ backdropFilter: 'saturate(140%) blur(2px)' }}>{mbti}</span>
                                        <span className="px-2 py-1 text-xs rounded-full bg-white/20 text-white" style={{ backdropFilter: 'saturate(140%) blur(2px)' }}>{zodiac}</span>
                                    </div>
                                </div>
                                <div className="mt-auto">
                                    <p className="text-sm text-white/95 line-clamp-2" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.65)' }}>{t(user.bio as keyof typeof locales.en)}</p>
                                    <p className="mt-1 text-xs text-white/90" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>Nhấn đúp để lật thẻ</p>
                                </div>
                            </div>
                            {isTop && (
                                <>
                                    <div className={`absolute top-10 left-6 text-red-500 border-4 border-red-500 rounded-xl px-4 py-1 text-3xl font-bold transform -rotate-12 transition-opacity duration-300 ${position.x > 20 ? 'opacity-100' : 'opacity-0'}`}>{t('like')}</div>
                                    <div className={`absolute top-10 right-6 text-yellow-500 border-4 border-yellow-500 rounded-xl px-4 py-1 text-3xl font-bold transform rotate-12 transition-opacity duration-300 ${position.x < -20 ? 'opacity-100' : 'opacity-0'}`}>{t('nope')}</div>
                                </>
                            )}
                        </div>
                    );
                })()}
                <div className="back rounded-xl overflow-hidden bg-black">
                    <div className="absolute inset-0 p-6 text-white flex flex-col">
                        <h3 className="text-2xl font-bold">Giới thiệu</h3>
                        <p className="mt-2 text-white/90">{t(user.bio as keyof typeof locales.en)}</p>
                        <div className="mt-3">
                            <h4 className="font-semibold">Gu bạn tìm kiếm</h4>
                            <p className="text-white/80 text-sm">{myProfile.status || 'Chưa cập nhật'}</p>
                        </div>
                        <div className="mt-4">
                            <h4 className="font-semibold">Mạng xã hội</h4>
                            <div className="mt-2 relative">
                                <div className="blur-sm select-none pointer-events-none">
                                    Facebook: @example
                                    <br/>
                                    Instagram: @example
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/20">Premium để xem</span>
                                </div>
                            </div>
                        </div>
                        <p className="mt-auto text-sm text-white/60">Nhấn để lật lại</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ProfileCard;

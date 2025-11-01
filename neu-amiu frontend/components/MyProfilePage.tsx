import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import Header from './Header';
import { PlusIcon, CrossIcon, EditIcon } from '../assets/icons';
// Local pastel palettes and symbols for MBTI/Zodiac display
const mbtiColors: Record<string, [string, string]> = {
  ENFP: ['#9AD8D6', '#D7C6E6'], INFP: ['#BFD8B8', '#A7C7E7'], ENTP: ['#F7B2AD', '#BDE0FE'], INTP: ['#C9D4F0', '#CDD5E0'],
  ENTJ: ['#F2D4AE', '#CBB4D4'], INTJ: ['#D7C6E6', '#9AD8D6'], ENFJ: ['#F7C8D0', '#BFD8B8'], INFJ: ['#A7C7E7', '#D7C6E6'],
  ESFP: ['#F7C8D0', '#FCE7A1'], ISFP: ['#BFD8B8', '#CBB4D4'], ESTP: ['#BDE0FE', '#F2D4AE'], ISTP: ['#CDD5E0', '#BFD8B8'],
  ESFJ: ['#C9D4F0', '#F7C8D0'], ISFJ: ['#D7C6E6', '#A7C7E7'], ESTJ: ['#FCE7A1', '#BFD8B8'], ISTJ: ['#A7C7E7', '#C9D4F0'],
};
const zodiacColors: Record<string, [string, string]> = {
  Aries: ['#F2D4AE', '#F7B2AD'], Taurus: ['#C8D5B9', '#BFD8B8'], Gemini: ['#BDE0FE', '#9AD8D6'], Cancer: ['#D7C6E6', '#A7C7E7'],
  Leo: ['#F2D4AE', '#FCE7A1'], Virgo: ['#C8D5B9', '#C9D4F0'], Libra: ['#F7C8D0', '#C9D4F0'], Scorpio: ['#CBB4D4', '#F7C8D0'],
  Sagittarius: ['#FCE7A1', '#BFD8B8'], Capricorn: ['#CDD5E0', '#A7C7E7'], Aquarius: ['#BDE0FE', '#9AD8D6'], Pisces: ['#D7C6E6', '#F7C8D0'],
};
const zodiacSymbols: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};
const mbtiEmojis: Record<string, string> = {
  ENFP: '✨', INFP: '🎨', ENTP: '⚡', INTP: '🧠', ENTJ: '🚀', INTJ: '♟️', ENFJ: '🤝', INFJ: '🌱', ESFP: '🎉', ISFP: '🖌️', ESTP: '🏃', ISTP: '🛠️', ESFJ: '🎀', ISFJ: '🛡️', ESTJ: '📣', ISTJ: '📐',
};
// Options for editing MBTI/Zodiac
const MBTI_TYPES = Object.keys(mbtiColors) as string[];
const ZODIAC_SIGNS = Object.keys(zodiacColors) as string[];

const MyProfilePage: React.FC = () => {
    const { t, userEmail, myPhotos, myProfile, onboardingAnswers, addPhoto, updateMyProfile, deletePhoto } = useStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ 
        name: '', bio: '', status: '', avatar: '', 
        nickname: '',
        gender: undefined as undefined | 'male' | 'female' | 'other',
        age: undefined as undefined | number,
        slogan: '',
        mbti: undefined as undefined | string,
        zodiac: undefined as undefined | string,
        interests: [] as string[],
        cardFrame: 'classic' as 'classic' | 'sunset' | 'ocean' | 'forest' | 'glass' | 'luxe' | 'neon' | 'royal' | 'midnight' | 'peach' | 'cyber' | 'pastel',
        socialLinks: { instagram: '', facebook: '', tiktok: '' }
    });
    const [interestInput, setInterestInput] = useState('');

    useEffect(() => {
        if (myProfile && !isEditing) {
            setFormData({ 
                name: myProfile.name, 
                bio: myProfile.bio,
                status: myProfile.status || onboardingAnswers.status || '',
                avatar: myProfile.avatar || '',
                nickname: myProfile.nickname || '',
                gender: myProfile.gender || onboardingAnswers.gender,
                age: myProfile.age,
                slogan: myProfile.slogan || '',
                mbti: myProfile.mbti || onboardingAnswers.mbti,
                zodiac: myProfile.zodiac || onboardingAnswers.zodiac,
                interests: myProfile.interests && myProfile.interests.length > 0 
                    ? myProfile.interests 
                    : (onboardingAnswers.interests || []),
                cardFrame: myProfile.cardFrame || 'classic',
                socialLinks: {
                    instagram: myProfile.socialLinks?.instagram || '',
                    facebook: myProfile.socialLinks?.facebook || '',
                    tiktok: myProfile.socialLinks?.tiktok || ''
                }
            });
        }
    }, [myProfile, onboardingAnswers, isEditing]);

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    addPhoto(e.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Persist edited data to profile
            updateMyProfile({
                bio: formData.bio,
                nickname: formData.nickname,
                status: formData.status,
                avatar: formData.avatar,
                mbti: formData.mbti,
                zodiac: formData.zodiac,
                slogan: formData.slogan,
                interests: formData.interests,
                cardFrame: formData.cardFrame,
                socialLinks: formData.socialLinks,
            });
        }
        setIsEditing(!isEditing);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('socialLinks.')) {
            const socialKey = name.split('.')[1];
            setFormData({ 
                ...formData, 
                socialLinks: { 
                    ...formData.socialLinks, 
                    [socialKey]: value 
                }
            });
        } else if (name === 'age') {
            const num = Number(value);
            setFormData({ ...formData, age: isNaN(num) ? undefined : num });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const triggerAvatarUpload = () => {
        avatarInputRef.current?.click();
    };

    const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setFormData({ ...formData, avatar: e.target.result as string });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeletePhoto = (photoUrl: string) => {
        if (window.confirm(t('deletePhotoConfirm'))) {
            deletePhoto(photoUrl);
        }
    };

    const handleAddInterest = () => {
        const val = interestInput.trim();
        if (!val) return;
        if (!formData.interests.includes(val)) {
            setFormData({ ...formData, interests: [...formData.interests, val] });
        }
        setInterestInput('');
    };

    const handleRemoveInterest = (val: string) => {
        setFormData({ ...formData, interests: formData.interests.filter(i => i !== val) });
    };

    return (
        <div className="flex flex-col h-full">
            <Header />
            <main className="flex-grow p-4 overflow-y-auto">
                <div className="flex justify-between items-center max-w-2xl mx-auto mb-6">
                    <h2 className="text-3xl font-bold">{t('myProfile')}</h2>
                    <button onClick={handleEditToggle} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors">
                        {isEditing ? (
                            t('saveProfile')
                        ) : (
                            <>
                                <EditIcon className="w-5 h-5" /> {t('editProfile')}
                            </>
                        )}
                    </button>
                </div>
                
                

                {/* Board: Thông tin cơ bản */}
                <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md space-y-4 mb-6">
                    <h3 className="text-xl font-bold">Thông tin cơ bản</h3>
                    <div>
                        <label className="font-semibold text-gray-600 dark:text-gray-400">{t('name')}</label>
                        <p className="text-lg">{myProfile.name}</p>
                    </div>
                    <div>
                        <label className="font-semibold text-gray-600 dark:text-gray-400">Nickname</label>
                        {isEditing ? (
                            <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} placeholder="Thêm nickname của bạn" className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        ) : (
                            <p className="text-lg">{myProfile.nickname || <span className="text-gray-400">Chưa có nickname</span>}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold text-gray-600 dark:text-gray-400">Giới tính</label>
                            <p className="text-lg">{myProfile.gender ? (myProfile.gender === 'male' ? 'Nam' : myProfile.gender === 'female' ? 'Nữ' : 'Khác') : <span className="text-gray-400">Chưa có giới tính</span>}</p>
                        </div>
                        <div>
                            <label className="font-semibold text-gray-600 dark:text-gray-400">Tuổi</label>
                            <p className="text-lg">{myProfile.age ?? <span className="text-gray-400">Chưa có tuổi</span>}</p>
                        </div>
                    </div>
                    <div>
                        <label className="font-semibold text-gray-600 dark:text-gray-400">Slogan</label>
                        {isEditing ? (
                            <input type="text" name="slogan" value={formData.slogan} onChange={handleChange} placeholder="Một câu nói ngắn gọn về bạn" className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        ) : (
                            <p className="text-lg">{myProfile.slogan || <span className="text-gray-400">Chưa có slogan</span>}</p>
                        )}
                    </div>
                    <div>
                        <label className="font-semibold text-gray-600 dark:text-gray-400">{t('avatar')}</label>
                        <div className="mt-2 flex items-center gap-4">
                            {(() => {
                                const initials = (formData.name || myProfile.name || 'U').trim().split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
                                const src = isEditing ? formData.avatar : myProfile.avatar;
                                return (
                                    <div className="relative">
                                        {src ? (
                                            <img src={src} alt="Avatar" className="w-24 h-24 rounded-full object-cover ring-2 ring-pink-300 shadow-md" style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }} />
                                        ) : (
                                            <div className="w-24 h-24 rounded-full ring-2 ring-pink-300 bg-gradient-to-br from-pink-200 to-blue-200 flex items-center justify-center text-xl font-bold text-black/70 shadow-md" style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                                                {initials}
                                            </div>
                                        )}
                                        {isEditing && (
                                            <button type="button" onClick={triggerAvatarUpload} className="absolute -bottom-2 -right-2 px-3 py-1 text-xs rounded-full bg-blue-600 text-white shadow hover:bg-blue-700">Tải ảnh</button>
                                        )}
                                    </div>
                                );
                            })()}
                            {!isEditing && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">{myProfile.avatar ? 'Ảnh đại diện hiện tại' : t('noAvatar')}</div>
                            )}
                        </div>
                        {isEditing && (
                            <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                        )}
                    </div>
                </div>

                {/* Board: MBTI & Cung hoàng đạo */}
                <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md space-y-4 mb-6">
                    <h3 className="text-xl font-bold">MBTI & Cung hoàng đạo</h3>
                    {isEditing && (
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">MBTI</label>
                                <select name="mbti" value={formData.mbti || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Chưa chọn</option>
                                    {MBTI_TYPES.map(m => (<option key={m} value={m}>{m}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">Cung hoàng đạo</label>
                                <select name="zodiac" value={formData.zodiac || ''} onChange={handleChange} className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Chưa chọn</option>
                                    {ZODIAC_SIGNS.map(z => (<option key={z} value={z}>{z}</option>))}
                                </select>
                            </div>
                        </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2 items-center">
                        {myProfile.mbti ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm text-black/80" style={{ backgroundImage: `linear-gradient(135deg, ${(mbtiColors[myProfile.mbti] || ['#E5E7EB','#D1D5DB'])[0]}, ${(mbtiColors[myProfile.mbti] || ['#E5E7EB','#D1D5DB'])[1]})` }}>
                                <span className="text-base leading-none">{mbtiEmojis[myProfile.mbti] || '✨'}</span>
                                <span className="font-semibold">{myProfile.mbti}</span>
                            </span>
                        ) : (
                            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-sm">Chưa có MBTI</span>
                        )}
                        {myProfile.zodiac ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm text-black/80" style={{ backgroundImage: `linear-gradient(135deg, ${(zodiacColors[myProfile.zodiac] || ['#E5E7EB','#D1D5DB'])[0]}, ${(zodiacColors[myProfile.zodiac] || ['#E5E7EB','#D1D5DB'])[1]})` }}>
                                <span className="text-base leading-none">{zodiacSymbols[myProfile.zodiac] || '☀️'}</span>
                                <span className="font-semibold">{myProfile.zodiac}</span>
                            </span>
                        ) : (
                            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-sm">Chưa có cung hoàng đạo</span>
                        )}
                    </div>
                </div>

                {/* Board: Tiểu sử */}
                <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md space-y-4 mb-6">
                    <h3 className="text-xl font-bold">Tiểu sử</h3>
                    <div>
                        <label className="font-semibold text-gray-600 dark:text-gray-400">{t('bio')}</label>
                        {isEditing ? (
                            <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder={t('bioPlaceholder')} rows={4} className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        ) : (
                            <p className="text-lg whitespace-pre-wrap">{myProfile.bio || <span className="text-gray-400">{t('bioPlaceholder')}</span>}</p>
                        )}
                    </div>
                    <div>
                        <label className="font-semibold text-gray-600 dark:text-gray-400">Status</label>
                        {isEditing ? (
                            <input type="text" name="status" value={formData.status} onChange={handleChange} placeholder="Ví dụ: Đang tìm mối quan hệ nghiêm túc; thích người ấm áp, tinh tế" className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        ) : (
                            <p className="text-lg">{myProfile.status || <span className="text-gray-400">Chưa có status</span>}</p>
                        )}
                    </div>
                </div>

                {/* Board: Sở thích */}
                <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md space-y-4 mb-6">
                    <h3 className="text-xl font-bold">Sở thích</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {(formData.interests || []).map((i) => (
                            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                                {i}
                                {isEditing && (<button type="button" onClick={() => handleRemoveInterest(i)} className="ml-1 text-gray-500 hover:text-red-600">×</button>)}
                            </span>
                        ))}
                        {isEditing && (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <input type="text" value={interestInput} onChange={(e) => setInterestInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddInterest(); } }} placeholder="Thêm sở thích, Enter để thêm" className="flex-1 sm:flex-none min-w-[200px] mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <button type="button" onClick={handleAddInterest} className="mt-1 px-3 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600">Thêm</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Board: Liên kết mạng xã hội */}
                <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md space-y-4 mb-6">
                    <h3 className="text-xl font-bold">Liên kết mạng xã hội</h3>
                    <div className="space-y-2 mt-1">
                        <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">Instagram</label>
                            {isEditing ? (
                                <input type="url" name="socialLinks.instagram" value={formData.socialLinks.instagram} onChange={handleChange} placeholder="https://instagram.com/username" className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            ) : (
                                <p className="text-sm">{myProfile.socialLinks?.instagram || <span className="text-gray-400">{t('notSet')}</span>}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">Facebook</label>
                            {isEditing ? (
                                <input type="url" name="socialLinks.facebook" value={formData.socialLinks.facebook} onChange={handleChange} placeholder="https://facebook.com/username" className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            ) : (
                                <p className="text-sm">{myProfile.socialLinks?.facebook || <span className="text-gray-400">{t('notSet')}</span>}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">TikTok</label>
                            {isEditing ? (
                                <input type="url" name="socialLinks.tiktok" value={formData.socialLinks.tiktok} onChange={handleChange} placeholder="https://tiktok.com/@username" className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            ) : (
                                <p className="text-sm">{myProfile.socialLinks?.tiktok || <span className="text-gray-400">{t('notSet')}</span>}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Board: Email */}
                <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md space-y-2 mb-6">
                    <h3 className="text-xl font-bold">Email</h3>
                    <p className="text-lg text-gray-500 dark:text-gray-400">{userEmail}</p>
                </div>

                <h3 className="text-2xl font-bold text-center my-6">
                    {t('myPhotos')} ({myPhotos.length}/6)
                </h3>
                <div className="grid grid-cols-3 gap-2 max-w-2xl mx-auto">
                    {myPhotos.map((photo, index) => (
                        <div key={photo} className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden group">
                            <img src={photo} alt={`My photo ${index + 1}`} className="w-full h-full object-cover" />
                            {isEditing && (
                                <button
                                    onClick={() => handleDeletePhoto(photo)}
                                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Delete photo"
                                    disabled={myPhotos.length <= 1}
                                >
                                    <CrossIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={triggerFileUpload}
                        disabled={myPhotos.length >= 6}
                        className={`aspect-square rounded-lg flex items-center justify-center transition-colors ${
                            myPhotos.length >= 6 
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                        aria-label={myPhotos.length >= 6 ? t('photoLimitReached') : t('uploadPhoto')}
                    >
                        <PlusIcon className="w-10 h-10" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePhotoUpload}
                        className="hidden"
                        accept="image/*"
                    />
                </div>

                {/* Board: Khung thẻ (dọc) + Preview — moved to last */}
                <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md space-y-4 my-6">
                    <h3 className="text-xl font-bold">Khung thẻ (dọc) & Preview</h3>
                    <div className="grid grid-cols-4 gap-3">
                        {(['classic','sunset','ocean','forest','glass','luxe','neon','royal','midnight','peach','cyber','pastel','aurora','sakura','rainbow','ember','ice','violet'] as const).map(k => (
                            <button
                                key={k}
                                type="button"
                                onClick={() => setFormData({ ...formData, cardFrame: k })}
                                className={`h-16 rounded-lg overflow-hidden ${formData.cardFrame === k ? 'ring-2 ring-blue-300' : ''}`}
                                aria-label={`Chọn khung ${k}`}
                            >
                                {(() => {
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
                                        classic: 'rgba(209,213,219,0.3)',
                                        sunset: 'rgba(247,178,173,0.3)',
                                        ocean: 'rgba(157,216,214,0.3)',
                                        forest: 'rgba(191,216,184,0.3)',
                                        glass: 'rgba(255,255,255,0.35)',
                                        luxe: 'rgba(212,175,55,0.35)',
                                        neon: 'rgba(241,91,181,0.35)',
                                        royal: 'rgba(95,106,191,0.35)',
                                        midnight: 'rgba(31,41,55,0.35)',
                                        peach: 'rgba(255,179,153,0.35)',
                                        cyber: 'rgba(0,201,255,0.35)',
                                        pastel: 'rgba(255,198,255,0.35)',
                                        aurora: 'rgba(127,0,255,0.3)',
                                        sakura: 'rgba(255,200,221,0.3)',
                                        rainbow: 'rgba(166,193,238,0.3)',
                                        ember: 'rgba(240,152,25,0.3)',
                                        ice: 'rgba(161,196,253,0.3)',
                                        violet: 'rgba(142,45,226,0.3)'
                                    };
                                    const gradient = gradients[k] || gradients.classic;
                                    const glow = glows[k] || glows.classic;
                                    return (
                                        <div
                                            className="relative w-full h-full rounded-lg"
                                            style={{
                                                border: '4px solid transparent',
                                                backgroundImage: `linear-gradient(#0000,#0000), ${gradient}`,
                                                backgroundClip: 'padding-box, border-box',
                                                boxShadow: `0 0 0 1px rgba(0,0,0,0.05), 0 8px 18px rgba(0,0,0,0.12), 0 0 18px ${glow}`
                                            }}
                                        >
                                            <div className="absolute inset-[6px] rounded-md overflow-hidden">
                                                <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                                                {/* corner highlights to suggest a frame */}
                                                <div className="absolute top-0 left-0 w-6 h-1 rounded-sm bg-white/40" />
                                                <div className="absolute top-0 right-0 w-6 h-1 rounded-sm bg-white/30" />
                                                <div className="absolute bottom-0 left-0 w-6 h-1 rounded-sm bg-white/30" />
                                                <div className="absolute bottom-0 right-0 w-6 h-1 rounded-sm bg-white/40" />
                                            </div>
                                        </div>
                                    );
                                })()}
                            </button>
                        ))}
                    </div>
                    {/* Vertical card preview */}
                    <div className="mt-4 grid grid-cols-1 gap-4">
                        <div className="relative w-full max-w-sm mx-auto aspect-[3/4] rounded-2xl overflow-hidden"
                             style={{
                                 border: '6px solid transparent',
                                 backgroundImage: (() => {
                                     const g: Record<string, string> = {
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
                                     const grad = g[formData.cardFrame] || g.classic;
                                     return `linear-gradient(#0000,#0000), ${grad}`;
                                 })(),
                                 backgroundClip: 'padding-box, border-box',
                                 boxShadow: `0 10px 24px rgba(0,0,0,0.2)`
                             }}
                        >
                            {(() => {
                                const src = formData.avatar || myProfile.avatar;
                                return (
                                    <>
                                        <div className="absolute inset-0" style={{ backgroundImage: src ? `url(${src})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                    </>
                                );
                            })()}
                            {/* Content overlay */}
                            <div className="absolute inset-0 p-5 flex flex-col">
                                <div className="flex flex-col gap-1">
                                    <div className="text-xl font-bold text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.75)' }}>{formData.name || myProfile.name}{formData.age || myProfile.age ? `, ${formData.age ?? myProfile.age}` : ''}</div>
                                    <div className="text-sm text-white/95" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}>{formData.slogan || myProfile.slogan || 'Slogan của bạn sẽ hiển thị ở đây'}</div>
                                    <div className="flex gap-2 mt-2">
                                        <span className="px-2 py-1 text-xs rounded-full bg-white/20 text-white" style={{ backdropFilter: 'saturate(140%) blur(2px)' }}>{formData.mbti || myProfile.mbti || 'MBTI?'}</span>
                                        <span className="px-2 py-1 text-xs rounded-full bg-white/20 text-white" style={{ backdropFilter: 'saturate(140%) blur(2px)' }}>{formData.zodiac || myProfile.zodiac || 'Cung?'}</span>
                                    </div>
                                </div>
                                <div className="mt-auto text-xs text-white/80">Khung dọc sẽ hiển thị ở màn hình Quẹt</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MyProfilePage;

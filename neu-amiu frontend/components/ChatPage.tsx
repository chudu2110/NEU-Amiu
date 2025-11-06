import React, { useState, useEffect, useRef, FC } from 'react';
import { useStore, Message, Location, MessageType } from '../hooks/useStore';
import type { User } from '../types';
import { BackIcon, ImageIcon, MapPinIcon, SendIcon, PaperclipIcon, PlayIcon, PauseIcon, StopIcon, TrashIcon } from '../assets/icons';
import socket from '../data/socket';

// --- Helper Functions ---
const fileToBase64 = (file: Blob | File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file as Blob);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// --- Sub-components ---
const AudioPlayer: FC<{ src: string }> = ({ src }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        const updateProgress = () => {
            if (audio && audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };
        const handleEnd = () => setIsPlaying(false);

        audio?.addEventListener('timeupdate', updateProgress);
        audio?.addEventListener('ended', handleEnd);
        return () => {
            audio?.removeEventListener('timeupdate', updateProgress);
            audio?.removeEventListener('ended', handleEnd);
        };
    }, []);

    return (
        <div className="flex items-center gap-2 w-48">
            <audio ref={audioRef} src={src} preload="metadata"></audio>
            <button onClick={togglePlay} className="text-white">
                {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
            </button>
            <div className="w-full bg-white/30 rounded-full h-1.5">
                <div className="bg-white h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};

const GifPicker: FC<{ onSelect: (url: string) => void, onClose: () => void }> = ({ onSelect, onClose }) => {
    const { t } = useStore();
    const gifs = [
        'https://media.giphy.com/media/3o7abBUNCb6HEsR00U/giphy.gif',
        'https://media.giphy.com/media/3oz8xAFtqoOUUrsh7W/giphy.gif',
        'https://media.giphy.com/media/3oEjI4sFlp73fvEYgw/giphy.gif',
        'https://media.giphy.com/media/d2Z9QYzA2H5wo/giphy.gif',
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">{t('selectGif')}</h3>
                <div className="grid grid-cols-2 gap-2">
                    {gifs.map(gif => (
                        <img key={gif} src={gif} onClick={() => onSelect(gif)} className="w-full h-auto object-cover rounded cursor-pointer" />
                    ))}
                </div>
            </div>
        </div>
    );
};

const DeleteConfirmationModal: FC<{ onConfirm: () => void; onCancel: () => void }> = ({ onConfirm, onCancel }) => {
    const { t } = useStore();
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onCancel}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm text-center shadow-xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-2">{t('deleteMessageTitle')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t('deleteMessageConfirm')}</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onCancel} className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">{t('cancel')}</button>
                    <button onClick={onConfirm} className="px-6 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">{t('delete')}</button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---
interface ChatPageProps {
    user: User;
    onBack: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ user, onBack }) => {
    const store = useStore();
    const { t, chats, addMessage, deleteMessage } = store;
    const [inputValue, setInputValue] = useState('');
    const [isAttachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
    const [isGifPickerOpen, setGifPickerOpen] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const longPressTimerRef = useRef<number>();

    const chat = chats.find(c => c.matchId === user.id);
    const messages = chat ? chat.messages : [];

    // For testing stage: use global-room (backend auto-joins it).
    // Later: replace with conversation id logic.
    const roomId = 'global-room';

    // Generate user ID từ email để đảm bảo consistency
    const generateUserIdFromEmail = (email: string | null): string => {
      if (!email) return 'me_local';
      let hash = 0;
      for (let i = 0; i < email.length; i++) {
        const char = email.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return String(Math.abs(hash) % 1000000);
    };
    
    // try to get real logged-in user id from store, otherwise fallback
    const userEmail = (store as any).userEmail;
    const myId = generateUserIdFromEmail(userEmail) || 'me_local';

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [messages]);

    // --- Socket integration ---
    useEffect(() => {
        // Tell server to join (server currently auto-joins global-room too, but it's fine)
        try {
            socket.emit('join', { roomId, userId: myId });
        } catch (err) {
            console.warn('Socket join failed', err);
        }

        // Handler for incoming messages (chỉ để hiển thị realtime khi đang mở ChatPage)
        // Lưu ý: App.tsx đã có listener toàn cục để nhận tin nhắn ở mọi trang
        // Handler này chỉ để đảm bảo tin nhắn hiển thị ngay khi đang trong ChatPage
        const handleIncoming = (payload: any) => {
            // Normalize IDs về string để so sánh chính xác
            const payloadFromStr = String(payload.from || '');
            const payloadToStr = String(payload.to || '');
            const myIdStr = String(myId || '');
            const userIdStr = String(user.id || '');
            
            // Bỏ qua tin nhắn từ chính mình (đã được thêm local rồi)
            if (payloadFromStr === myIdStr) {
                return;
            }

            // Chỉ xử lý tin nhắn từ user đang chat với (trong ChatPage này)
            // Tin nhắn gửi cho mình đã được xử lý bởi App.tsx global listener rồi
            const isFromCurrentChatUser = payloadFromStr === userIdStr;
            const isForMe = payloadToStr === myIdStr;
            
            // Chỉ xử lý nếu tin nhắn từ user đang chat với
            // App.tsx đã xử lý tin nhắn gửi cho mình rồi, nên không cần xử lý lại ở đây
            if (!isFromCurrentChatUser) {
                return; // Bỏ qua, để App.tsx xử lý
            }

            // Normalize payload into Message type expected by store
            const incoming: Message = {
                id: payload.id ?? Date.now() + Math.random(),
                sender: 'them',
                timestamp: payload.ts ?? Date.now(),
                type: (payload.type as MessageType) ?? 'text',
                content: payload.content ?? payload.text ?? '',
            };

            // Check duplicate - tin nhắn có thể đã được thêm bởi App.tsx global listener
            const currentChat = chats.find(c => c.matchId === user.id);
            const currentMessages = currentChat ? currentChat.messages : [];
            
            // Check duplicate dựa trên ID
            const existsById = currentMessages.some(m => m.id === incoming.id);
            if (existsById) {
                return; // Đã có, bỏ qua
            }
            
            // Check duplicate dựa trên content và timestamp
            const existsByContent = currentMessages.some(m => 
                m.content === incoming.content && 
                Math.abs(m.timestamp - incoming.timestamp) < 1000 &&
                m.sender === incoming.sender
            );
            
            if (existsByContent) {
                return; // Đã có, bỏ qua
            }

            // Thêm tin nhắn (trường hợp này hiếm vì App.tsx đã xử lý rồi)
            // Nhưng giữ lại để đảm bảo không miss tin nhắn
            addMessage(user.id, incoming);
        };

        socket.on('message', handleIncoming);

        socket.on('user:joined', (d: any) => {
            // optional: show toast or update presence
            // console.log('user joined', d);
        });

        return () => {
            socket.off('message', handleIncoming);
            socket.off('user:joined');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, user.id, myId, chats]);

    const createAndAddMessage = async (type: MessageType, content: string | Location) => {
        const newMessage: Message = { id: Date.now(), type, content, sender: 'me', timestamp: Date.now() };
        // optimistic local add
        addMessage(user.id, newMessage);

        // build payload to server
        const payload: any = {
            roomId,
            from: myId,
            to: user.id,
            ts: newMessage.timestamp,
            id: newMessage.id,
            type,
            // server expects `text` in current backend implementation: put serialized content there
            text: typeof content === 'string' ? content : JSON.stringify(content),
            // keep content as well for future-backend compatibility
            content: typeof content === 'string' ? content : content,
        };

        try {
            socket.emit('message', payload);
        } catch (err) {
            console.warn('Socket emit error', err);
        }
    };

    const handleSendText = () => {
        if (inputValue.trim() === '') return;
        createAndAddMessage('text', inputValue);
        setInputValue('');
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const base64 = await fileToBase64(file);
            await createAndAddMessage('image', base64);
        }
        setAttachmentMenuOpen(false);
    };

    const handleSendLocation = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                createAndAddMessage('location', { lat: latitude, lon: longitude });
            },
            (error) => {
                console.error(error);
                alert(t('locationError'));
            }
        );
        setAttachmentMenuOpen(false);
    };

    const handleGifSelect = (url: string) => {
        createAndAddMessage('gif', url);
        setGifPickerOpen(false);
    };

    const handlePressStart = (message: Message) => {
        if (message.sender !== 'me') return;
        longPressTimerRef.current = window.setTimeout(() => {
            setMessageToDelete(message);
        }, 500);
    };

    const handlePressEnd = () => {
        clearTimeout(longPressTimerRef.current);
    };

    const handleConfirmDelete = () => {
        if (messageToDelete) {
            deleteMessage(user.id, messageToDelete.id);
            setMessageToDelete(null);
            // optionally notify server about deletion if you implement it
        }
    };

    const renderMessageContent = (msg: Message) => {
        switch (msg.type) {
            case 'image': return <img src={msg.content as string} className="max-w-xs rounded-lg" alt="Sent image" />;
            case 'audio': return <AudioPlayer src={msg.content as string} />;
            case 'location': {
                const { lat, lon } = msg.content as Location;
                return <a href={`https://www.google.com/maps?q=${lat},${lon}`} target="_blank" rel="noopener noreferrer" className="text-white underline font-semibold flex items-center gap-2"><MapPinIcon className="w-5 h-5" /> {t('viewOnMap')}</a>;
            }
            case 'gif': return <img src={msg.content as string} className="max-w-[150px] rounded-lg" alt="Sent GIF" />;
            case 'text':
            default: return msg.content;
        }
    };

    const AttachmentButton: FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
        <button onClick={onClick} className="flex flex-col items-center text-gray-700 dark:text-gray-300">
            <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center mb-1">{icon}</div>
            <span className="text-xs">{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-gray-100 dark:bg-black">
            {isGifPickerOpen && <GifPicker onSelect={handleGifSelect} onClose={() => setGifPickerOpen(false)} />}
            {messageToDelete && <DeleteConfirmationModal onConfirm={handleConfirmDelete} onCancel={() => setMessageToDelete(null)} />}
            <header className="flex items-center p-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm z-10">
                <button onClick={onBack} className="p-2 mr-2"> <BackIcon className="w-6 h-6" /> </button>
                <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                <h2 className="font-bold text-lg ml-3">{user.name}</h2>
            </header>

            <main className="flex-grow p-4 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'them' && <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full object-cover self-start" />}
                            <div className={`p-3 max-w-[80%] break-words rounded-2xl shadow ${
                                msg.sender === 'me' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-none cursor-pointer' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                            }`}
                                onMouseDown={msg.sender === 'me' ? () => handlePressStart(msg) : undefined}
                                onMouseUp={msg.sender === 'me' ? handlePressEnd : undefined}
                                onMouseLeave={msg.sender === 'me' ? handlePressEnd : undefined}
                                onTouchStart={msg.sender === 'me' ? () => handlePressStart(msg) : undefined}
                                onTouchEnd={msg.sender === 'me' ? handlePressEnd : undefined}
                            >
                                {renderMessageContent(msg)}
                            </div>
                        </div>
                    ))}
                </div>
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                {isAttachmentMenuOpen && (
                    <div className="grid grid-cols-4 gap-4 p-4 mb-2 bg-gray-200 dark:bg-gray-800 rounded-lg">
                        <AttachmentButton icon={<ImageIcon className="w-6 h-6" />} label={t('sendPhoto')} onClick={() => fileInputRef.current?.click()} />
                        <AttachmentButton icon={<MapPinIcon className="w-6 h-6" />} label={t('sendLocation')} onClick={handleSendLocation} />
                        <AttachmentButton icon={<b className="text-lg">GIF</b>} label={t('sendGif')} onClick={() => { setGifPickerOpen(true); setAttachmentMenuOpen(false); }} />
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <button onClick={() => setAttachmentMenuOpen(!isAttachmentMenuOpen)} className="p-2 text-gray-500 dark:text-gray-400">
                       <PaperclipIcon className="w-6 h-6" />
                    </button>
                    <input
                        type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                        placeholder={t('typeMessage')} className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={handleSendText} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                       <SendIcon className="w-6 h-6" />
                    </button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageSelect} className="hidden" accept="image/*" />
            </footer>
        </div>
    );
};

export default ChatPage;
